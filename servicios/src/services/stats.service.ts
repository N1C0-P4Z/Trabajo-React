import { prisma } from '../config/database';

export const statsService = {
  async getDashboardStats() {
    const totalPatients = await prisma.patient.count();

    const totalDoctors = await prisma.user.count({
      where: { role: 'DENTIST' }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.count({
      where: {
        datetime: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: { in: ['PENDIENTE', 'scheduled'] }
      }
    });

    return {
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments
    };
  }
};