import { Router } from 'express';
import { paymentController } from '../../controllers/payment.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('SUPER_ADMIN', 'OWNER', 'SECRETARY'));

router.get('/', paymentController.list);
router.get('/:id', paymentController.getById);
router.post('/', paymentController.create);
router.put('/:id', paymentController.update);

export default router;
