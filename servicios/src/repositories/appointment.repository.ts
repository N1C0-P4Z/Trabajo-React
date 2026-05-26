import { prisma } from '../config/database';

const appointmentIncludes = {
  patient: {
    select: {
      id: true,
      first_name: true,
      last_name: true
    }
  },
  doctor: {
    select: {
      id: true,
      first_name: true,
      last_name: true
    }
  },
  type: {
    select: {
      id: true,
      name: true,
      color: true
    }
  }
};

export const appointmentRepository = {
  async findByDateRange(start: Date, end: Date) {
    return await prisma.appointment.findMany({
      where: {
        datetime: {
          gte: start,
          lte: end
        }
      },
      include: appointmentIncludes,
      orderBy: { datetime: 'asc' }
    });
  },

  async findById(id: number) {
    return await prisma.appointment.findUnique({
      where: { id },
      include: appointmentIncludes
    });
  },

  async create(data: {
    patient_id: number;
    doctor_id: number;
    datetime: Date;
    duration_minutes?: number;
    type_id?: number;
    status?: string;
    notes?: string;
    obra_social?: string;
  }) {
    return await prisma.appointment.create({
      data,
      include: appointmentIncludes
    });
  },

  async update(id: number, data: {
    patient_id?: number;
    doctor_id?: number;
    datetime?: Date;
    duration_minutes?: number;
    type_id?: number;
    status?: string;
    notes?: string;
    obra_social?: string;
  }) {
    return await prisma.appointment.update({
      where: { id },
      data,
      include: appointmentIncludes
    });
  },

  async delete(id: number) {
    return await prisma.appointment.delete({
      where: { id }
    });
  }
};
