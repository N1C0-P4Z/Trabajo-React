import { Router } from 'express';
import { statsController } from '../../controllers/stats.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

router.get(
  '/',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'OWNER', 'SECRETARY'),
  statsController.getDashboardStats
);

export default router;