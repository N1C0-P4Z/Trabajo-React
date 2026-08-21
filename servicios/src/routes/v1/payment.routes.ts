import { Router } from 'express';
import { paymentController } from '../../controllers/payment.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { audit } from '../../middlewares/audit';

const router = Router();

router.get(
  '/:id/pdf',
  authenticateToken,
  audit({ action: 'READ', resource: 'payment', resourceIdParam: 'id' }),
  paymentController.getReceiptPdf
);

router.use(authenticateToken);
router.use(requireRole('SUPER_ADMIN', 'OWNER', 'SECRETARY'));

router.get('/', audit({ action: 'READ', resource: 'payment' }), paymentController.list);
router.get('/:id', audit({ action: 'READ', resource: 'payment', resourceIdParam: 'id' }), paymentController.getById);
router.post('/', audit({ action: 'CREATE', resource: 'payment' }), paymentController.create);
router.put('/:id', audit({ action: 'UPDATE', resource: 'payment', resourceIdParam: 'id' }), paymentController.update);

export default router;
