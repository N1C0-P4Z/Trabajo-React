import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import appointmentRoutes from './appointment.routes';
import appointmentTypeRoutes from './appointment-type.routes';
import specialtiesRoutes from './specialties.routes';
import patientRoutes from './patient.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/appointment-types', appointmentTypeRoutes);
router.use('/specialties', specialtiesRoutes);
router.use('/stats', statsRoutes);

export default router;
