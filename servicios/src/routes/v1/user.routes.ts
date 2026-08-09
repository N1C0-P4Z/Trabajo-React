import { Router } from 'express';
import { userController } from '../../controllers/user.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { handlePhotoUpload } from '../../middlewares/upload';

const router = Router();

// Antes de /:id para que "me" no se tome como id
router.get('/me/data', authenticateToken, userController.getMeData);
router.delete('/me', authenticateToken, userController.deleteMe);

router.post('/me/photo', authenticateToken, requireRole('DENTIST'), handlePhotoUpload, userController.uploadPhoto);

// Mutating routes: only SUPER_ADMIN and OWNER can create/update/delete users
router.post('/', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.register);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'OWNER'), userController.deleteUser);

// Read routes: authentication required
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);

export default router;
