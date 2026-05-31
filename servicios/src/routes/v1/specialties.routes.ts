import { Router } from 'express';
import { userController } from '../../controllers/user.controller';
import { authenticateToken } from '../../middlewares/auth';

const router = Router();

// GET /v1/specialties — catálogo fijo de especialidades odontológicas
// Requiere autenticación (cualquier rol)
router.get('/', authenticateToken, userController.getSpecialties);

export default router;
