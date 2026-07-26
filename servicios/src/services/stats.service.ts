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

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyIncomeResult = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETADO',
        paid_at: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: { amount: true },
    });

    return {
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
      monthlyIncome: monthlyIncomeResult._sum.amount ?? 0
    };
  }
};