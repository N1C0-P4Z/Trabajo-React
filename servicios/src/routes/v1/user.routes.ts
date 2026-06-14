import { Router } from 'express';
import { userController } from '../../controllers/user.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

// Mutating routes: only SUPER_ADMIN and OWNER can create/update/delete users
router.post('/', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.register);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.deleteUser);

// Read routes: authentication required
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);

export default router;
