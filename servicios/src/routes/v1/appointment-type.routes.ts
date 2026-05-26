import { Router } from 'express';
import { appointmentTypeController } from '../../controllers/appointment-type.controller';
import { authenticateToken } from '../../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', appointmentTypeController.getAll);
router.get('/:id', appointmentTypeController.getById);
router.post('/', appointmentTypeController.create);
router.put('/:id', appointmentTypeController.update);
router.delete('/:id', appointmentTypeController.delete);

export default router;
