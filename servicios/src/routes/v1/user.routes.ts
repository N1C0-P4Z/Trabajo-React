import { Router } from 'express';
import { userController } from '../../controllers/user.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

// Mutating routes: only SUPER_ADMIN and OWNER can create/update/delete users
router.post('/', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.register);
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.updateUser);
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.deleteUser);

// Read routes: no restriction (needed by agenda and other modules)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

export default router;
