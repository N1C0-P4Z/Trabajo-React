import { Router } from 'express';
import { userController } from '../../controllers/user.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

// Self-registration: public (anyone can create a PATIENT account)
router.post('/', userController.register);

// Mutating routes: only SUPER_ADMIN and OWNER can update/delete users
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.updateUser);
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.deleteUser);

// Read routes: no restriction (needed by agenda and other modules)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

export default router;
