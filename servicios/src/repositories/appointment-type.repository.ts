import { prisma } from '../config/database';

export const appointmentTypeRepository = {
  async findAll() {
    return await prisma.appointmentType.findMany({
      orderBy: { name: 'asc' }
    });
  },

  async findById(id: number) {
    return await prisma.appointmentType.findUnique({
      where: { id }
    });
  },

  async findByName(name: string) {
    return await prisma.appointmentType.findUnique({
      where: { name }
    });
  },

  async create(data: {
    name: string;
    description?: string;
    suggested_duration_minutes?: number;
    color?: string;
  }) {
    return await prisma.appointmentType.create({
      data
    });
  },

  async update(id: number, data: {
    name?: string;
    description?: string;
    suggested_duration_minutes?: number;
    color?: string;
  }) {
    return await prisma.appointmentType.update({
      where: { id },
      data
    });
  },

  async delete(id: number) {
    return await prisma.appointmentType.delete({
      where: { id }
    });
  },

  async unlinkAppointments(typeId: number) {
    return await prisma.appointment.updateMany({
      where: { type_id: typeId },
      data: { type_id: null }
    });
  }
};
