import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import appointmentRoutes from './appointment.routes';
import appointmentTypeRoutes from './appointment-type.routes';
import specialtiesRoutes from './specialties.routes';
import patientRoutes from './patient.routes';
import paymentRoutes from './payment.routes';
import receiptRoutes from './receipt.routes';
import statsRoutes from './stats.routes';
import configRoutes from './config.routes';

const router = Router();

router.use('/config', configRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/receipts', receiptRoutes);
router.use('/payments', paymentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/appointment-types', appointmentTypeRoutes);
router.use('/specialties', specialtiesRoutes);
router.use('/stats', statsRoutes);

export default router;
