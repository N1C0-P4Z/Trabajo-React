import { Router } from 'express';
import { appointmentTypeController } from '../../controllers/appointment-type.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

router.use(authenticateToken);

router.get('/', appointmentTypeController.getAll);
router.get('/:id', appointmentTypeController.getById);

router.post('/', requireRole('SUPER_ADMIN', 'OWNER'), appointmentTypeController.create);
router.put('/:id', requireRole('SUPER_ADMIN', 'OWNER'), appointmentTypeController.update);
router.delete('/:id', requireRole('SUPER_ADMIN', 'OWNER'), appointmentTypeController.delete);

export default router;
