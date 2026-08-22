import { prisma } from '../config/database';

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  role: true,
  is_active: true,
  dni: true,
};

const paymentPublicSelect = {
  id: true,
  patient_id: true,
  appointment_id: true,
  amount: true,
  payment_method: true,
  status: true,
  notes: true,
  paid_at: true,
  created_by: true,
  created_at: true,
  receipt_number: true,
  patient: {
    select: publicUserSelect,
  },
  appointment: {
    select: {
      id: true,
      datetime: true,
      status: true,
    },
  },
  recorder: {
    select: publicUserSelect,
  },
};

const receiptPaymentSelect = {
  id: true,
  patient_id: true,
  appointment_id: true,
  amount: true,
  payment_method: true,
  status: true,
  paid_at: true,
  receipt_number: true,
  patient: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      dni: true,
      role: true,
      patient: {
        select: {
          dni: true,
          obra_social: true,
        },
      },
    },
  },
  appointment: {
    select: {
      obra_social: true,
      type: {
        select: { name: true },
      },
      doctor: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
  },
};

export interface PaymentFilters {
  search?: string;
  patient_id?: number;
  status?: string;
  payment_method?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  limite?: number;
}

export const paymentRepository = {
  async findAll(filters: PaymentFilters) {
    const {
      search,
      patient_id,
      status,
      payment_method,
      desde,
      hasta,
      pagina = 1,
      limite = 10,
    } = filters;

    const where: any = {};
    const AND: any[] = [];

    if (patient_id) {
      AND.push({ patient_id: Number(patient_id) });
    }

    if (status) {
      AND.push({ status });
    }

    if (payment_method) {
      AND.push({ payment_method });
    }

    if (desde || hasta) {
      const dateFilter: any = {};
      if (desde) dateFilter.gte = new Date(desde);
      if (hasta) dateFilter.lte = new Date(hasta + 'T23:59:59.999');
      AND.push({ paid_at: dateFilter });
    }

    if (search) {
      AND.push({
        OR: [
          { patient: { first_name: { contains: search } } },
          { patient: { last_name: { contains: search } } },
          { notes: { contains: search } },
        ],
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: paymentPublicSelect,
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { paid_at: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: number) {
    return await prisma.payment.findUnique({
      where: { id },
      select: paymentPublicSelect,
    });
  },

  async findByIdForReceipt(id: number) {
    return await prisma.payment.findUnique({
      where: { id },
      select: receiptPaymentSelect,
    });
  },

  async create(data: {
    patient_id: number;
    appointment_id?: number | null;
    amount: number;
    payment_method: string;
    status?: string;
    notes?: string | null;
    paid_at?: Date;
    created_by?: number | null;
    receipt_number?: number | null;
  }) {
    return await prisma.payment.create({
      data,
      select: paymentPublicSelect,
    });
  },

  async update(id: number, data: {
    amount?: number;
    payment_method?: string;
    status?: string;
    notes?: string | null;
    paid_at?: Date;
    appointment_id?: number | null;
    receipt_number?: number | null;
  }) {
    return await prisma.payment.update({
      where: { id },
      data,
      select: paymentPublicSelect,
    });
  },

  async saveReceiptToken(paymentId: number, hash: string, expiresAt: Date) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        receipt_token_hash: hash,
        receipt_token_expires_at: expiresAt,
      },
    });
  },

  async assignReceiptNumber(paymentId: number): Promise<number> {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: { receipt_number: true },
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      if (payment.receipt_number != null) {
        return payment.receipt_number;
      }

      const maxResult = await tx.payment.aggregate({
        _max: { receipt_number: true },
      });
      const nextNumber = (maxResult._max.receipt_number ?? 0) + 1;

      await tx.payment.update({
        where: { id: paymentId },
        data: { receipt_number: nextNumber },
      });

      return nextNumber;
    });
  },
};
