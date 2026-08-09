import { Router } from 'express';
import { appointmentController } from '../../controllers/appointment.controller';
import { authenticateToken } from '../../middlewares/auth';
import { audit } from '../../middlewares/audit';

const router = Router();

router.use(authenticateToken);

router.get('/me', audit({ action: 'READ', resource: 'appointment' }), appointmentController.getMyAppointments);
router.get('/', audit({ action: 'READ', resource: 'appointment' }), appointmentController.getAll);
router.get('/:id', audit({ action: 'READ', resource: 'appointment', resourceIdParam: 'id' }), appointmentController.getById);
router.post('/', audit({ action: 'CREATE', resource: 'appointment' }), appointmentController.create);
router.put('/:id', audit({ action: 'UPDATE', resource: 'appointment', resourceIdParam: 'id' }), appointmentController.update);
router.delete('/:id', audit({ action: 'DELETE', resource: 'appointment', resourceIdParam: 'id' }), appointmentController.delete);

export default router;
