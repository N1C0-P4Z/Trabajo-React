import { Router } from 'express';
import { appointmentController } from '../../controllers/appointment.controller';
import { authenticateToken } from '../../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', appointmentController.getAll);
router.get('/:id', appointmentController.getById);
router.post('/', appointmentController.create);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.delete);

export default router;
