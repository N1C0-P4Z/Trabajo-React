import { createHash, randomBytes } from 'crypto';
import { prisma } from '../config/database';
import { paymentRepository, PaymentFilters } from '../repositories/payment.repository';
import { AppError } from '../utils/errors';
import { buildReceiptPdf } from './receipt-pdf.service';

const VALID_METHODS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OBRA_SOCIAL'];
const VALID_STATUSES = ['PENDIENTE', 'COMPLETADO', 'ANULADO'];
const STAFF_ROLES = ['SUPER_ADMIN', 'OWNER', 'SECRETARY'];

function validatePaymentId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (!numId || isNaN(numId)) {
    throw new AppError('ID de pago inválido', 400);
  }
  return numId;
}

function assertWriteAccess(requestingUser?: { userId: number; role: string } | null) {
  if (!requestingUser || !STAFF_ROLES.includes(requestingUser.role)) {
    throw new Error('No autorizado para gestionar pagos');
  }
}

async function issuePreviewToken(paymentId: number): Promise<string> {
  const raw = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await paymentRepository.saveReceiptToken(paymentId, hash, expiresAt);
  return raw;
}

function shouldIssueToken(status: string, previousStatus?: string): boolean {
  if (status !== 'COMPLETADO' && status !== 'ANULADO') return false;
  if (previousStatus === undefined) return true;
  return status !== previousStatus;
}

export const paymentService = {
  async listPayments(filters: PaymentFilters) {
    const { data, total } = await paymentRepository.findAll(filters);
    const pagina = filters.pagina || 1;
    const limite = filters.limite || 10;
    return { data, total, pagina, limite };
  },

  async getPaymentById(id: string | number) {
    const numId = validatePaymentId(id);
    const payment = await paymentRepository.findById(numId);
    if (!payment) {
      throw new AppError('Pago no encontrado', 404);
    }
    return payment;
  },

  async createPayment(
    data: {
      patient_id: number;
      appointment_id?: number;
      amount: number;
      payment_method: string;
      status?: string;
      notes?: string;
      paid_at?: string;
    },
    requestingUser?: { userId: number; role: string } | null
  ) {
    assertWriteAccess(requestingUser);

    const { patient_id, appointment_id, amount, payment_method, status, notes, paid_at } = data;

    if (!patient_id) {
      throw new AppError('El paciente es requerido', 400);
    }
    if (!appointment_id) {
      throw new AppError('El turno es requerido', 400, 'appointment_id');
    }
    if (!amount || amount <= 0) {
      throw new AppError('El monto debe ser mayor a cero', 400);
    }
    if (!payment_method || !VALID_METHODS.includes(payment_method)) {
      throw new AppError('Método de pago inválido', 400);
    }

    const patient = await prisma.user.findFirst({
      where: { id: patient_id, role: 'PATIENT' },
    });
    if (!patient) {
      throw new AppError('Paciente no encontrado', 404);
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
    });
    if (!appointment) {
      throw new AppError('Turno no encontrado', 404);
    }
    if (appointment.patient_id !== patient_id) {
      throw new AppError('El turno no pertenece al paciente seleccionado', 400);
    }

    const paymentStatus = status || 'COMPLETADO';
    if (!VALID_STATUSES.includes(paymentStatus)) {
      throw new AppError('Estado de pago inválido', 400);
    }

    const payment = await paymentRepository.create({
      patient_id,
      appointment_id,
      amount: Number(amount),
      payment_method,
      status: paymentStatus,
      notes: notes?.trim() || null,
      paid_at: paid_at ? new Date(paid_at) : new Date(),
      created_by: requestingUser?.userId ?? null,
    });

    if (paymentStatus === 'COMPLETADO') {
      await paymentRepository.assignReceiptNumber(payment.id);
    }

    let preview_token: string | undefined;
    if (shouldIssueToken(paymentStatus)) {
      preview_token = await issuePreviewToken(payment.id);
    }

    const result = await paymentRepository.findById(payment.id);
    return preview_token ? { ...result, preview_token } : result;
  },

  async updatePayment(
    id: string | number,
    data: {
      amount?: number;
      payment_method?: string;
      status?: string;
      notes?: string;
      paid_at?: string;
      appointment_id?: number;
    },
    requestingUser?: { userId: number; role: string } | null
  ) {
    assertWriteAccess(requestingUser);

    const numId = validatePaymentId(id);
    const payment = await paymentRepository.findById(numId);
    if (!payment) {
      throw new AppError('Pago no encontrado', 404);
    }

    const updateData: {
      amount?: number;
      payment_method?: string;
      status?: string;
      notes?: string | null;
      paid_at?: Date;
      appointment_id?: number | null;
    } = {};

    if (data.appointment_id !== undefined) {
      if (payment.appointment_id) {
        throw new AppError('El turno ya está asociado al pago', 400);
      }
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointment_id },
      });
      if (!appointment) {
        throw new AppError('Turno no encontrado', 404);
      }
      if (appointment.patient_id !== payment.patient_id) {
        throw new AppError('El turno no pertenece al paciente del pago', 400);
      }
      updateData.appointment_id = data.appointment_id;
    }

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new AppError('El monto debe ser mayor a cero', 400);
      }
      updateData.amount = Number(data.amount);
    }

    if (data.payment_method !== undefined) {
      if (!VALID_METHODS.includes(data.payment_method)) {
        throw new AppError('Método de pago inválido', 400);
      }
      updateData.payment_method = data.payment_method;
    }

    const previousStatus = payment.status;

    if (data.status !== undefined) {
      if (!VALID_STATUSES.includes(data.status)) {
        throw new AppError('Estado de pago inválido', 400);
      }
      updateData.status = data.status;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes === '' ? null : data.notes;
    }

    if (data.paid_at !== undefined) {
      updateData.paid_at = new Date(data.paid_at);
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No hay datos para actualizar', 400);
    }

    await paymentRepository.update(numId, updateData);

    const finalStatus = data.status ?? previousStatus;

    if (data.status === 'COMPLETADO' && previousStatus !== 'COMPLETADO') {
      await paymentRepository.assignReceiptNumber(numId);
    }

    let preview_token: string | undefined;
    if (data.status !== undefined && shouldIssueToken(finalStatus, previousStatus)) {
      preview_token = await issuePreviewToken(numId);
    }

    const result = await paymentRepository.findById(numId);
    return preview_token ? { ...result, preview_token } : result;
  },

  async getReceiptPdf(
    id: string | number,
    requestingUser: { userId: number; role: string }
  ): Promise<{ buffer: Buffer; filename: string }> {
    const numId = validatePaymentId(id);
    const payment = await paymentRepository.findByIdForReceipt(numId);

    const isStaff = STAFF_ROLES.includes(requestingUser.role);
    const isPatient = requestingUser.role === 'PATIENT' && payment?.patient_id === requestingUser.userId;
    if (!payment || (!isStaff && !isPatient)) {
      throw new AppError('Pago no encontrado', 404);
    }

    if (!payment.appointment_id) {
      throw new AppError('El comprobante requiere un turno asociado', 409);
    }
    if (payment.status === 'PENDIENTE') {
      throw new AppError('El comprobante no está disponible para pagos pendientes', 409);
    }
    if (payment.status !== 'COMPLETADO' && payment.status !== 'ANULADO') {
      throw new AppError('El comprobante no está disponible', 409);
    }

    if (payment.receipt_number == null && payment.status === 'COMPLETADO') {
      await paymentRepository.assignReceiptNumber(numId);
    }

    const listo = await paymentRepository.findByIdForReceipt(numId);
    if (!listo) {
      throw new AppError('Pago no encontrado', 404);
    }

    const buffer = await buildReceiptPdf(listo);
    const year = listo.paid_at.getFullYear();
    const nro = listo.receipt_number ?? 0;

    return { buffer, filename: `comprobante-${year}-${nro}.pdf` };
  },
};
