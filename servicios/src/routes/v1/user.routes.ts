import { Router } from 'express';
import { userController } from '../../controllers/user.controller';

const router = Router();

router.post('/', userController.register);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
