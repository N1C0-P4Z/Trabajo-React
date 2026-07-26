import { prisma } from '../config/database';
import { paymentRepository, PaymentFilters } from '../repositories/payment.repository';

const VALID_METHODS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OBRA_SOCIAL'];
const VALID_STATUSES = ['PENDIENTE', 'COMPLETADO', 'ANULADO'];
const WRITE_ROLES = ['SUPER_ADMIN', 'OWNER', 'SECRETARY'];

function validatePaymentId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (!numId || isNaN(numId)) {
    throw new Error('ID de pago inválido');
  }
  return numId;
}

function assertWriteAccess(requestingUser?: { userId: number; role: string } | null) {
  if (!requestingUser || !WRITE_ROLES.includes(requestingUser.role)) {
    throw new Error('No autorizado para gestionar pagos');
  }
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
      throw new Error('Pago no encontrado');
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
      throw new Error('El paciente es requerido');
    }
    if (!amount || amount <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }
    if (!payment_method || !VALID_METHODS.includes(payment_method)) {
      throw new Error('Método de pago inválido');
    }

    const patient = await prisma.user.findFirst({
      where: { id: patient_id, role: 'PATIENT' },
    });
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    if (appointment_id) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointment_id },
      });
      if (!appointment) {
        throw new Error('Turno no encontrado');
      }
      if (appointment.patient_id !== patient_id) {
        throw new Error('El turno no pertenece al paciente seleccionado');
      }
    }

    const paymentStatus = status || 'COMPLETADO';
    if (!VALID_STATUSES.includes(paymentStatus)) {
      throw new Error('Estado de pago inválido');
    }

    return await paymentRepository.create({
      patient_id,
      appointment_id: appointment_id || null,
      amount: Number(amount),
      payment_method,
      status: paymentStatus,
      notes: notes?.trim() || null,
      paid_at: paid_at ? new Date(paid_at) : new Date(),
      created_by: requestingUser?.userId ?? null,
    });
  },

  async updatePayment(
    id: string | number,
    data: {
      amount?: number;
      payment_method?: string;
      status?: string;
      notes?: string;
      paid_at?: string;
    },
    requestingUser?: { userId: number; role: string } | null
  ) {
    assertWriteAccess(requestingUser);

    const numId = validatePaymentId(id);
    const payment = await paymentRepository.findById(numId);
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    const updateData: {
      amount?: number;
      payment_method?: string;
      status?: string;
      notes?: string | null;
      paid_at?: Date;
    } = {};

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new Error('El monto debe ser mayor a cero');
      }
      updateData.amount = Number(data.amount);
    }

    if (data.payment_method !== undefined) {
      if (!VALID_METHODS.includes(data.payment_method)) {
        throw new Error('Método de pago inválido');
      }
      updateData.payment_method = data.payment_method;
    }

    if (data.status !== undefined) {
      if (!VALID_STATUSES.includes(data.status)) {
        throw new Error('Estado de pago inválido');
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
      throw new Error('No hay datos para actualizar');
    }

    return await paymentRepository.update(numId, updateData);
  },
};
