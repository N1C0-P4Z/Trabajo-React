import { Router } from 'express';
import { patientController } from '../../controllers/patient.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Lectura: cualquier usuario autenticado
router.get('/', patientController.list);
router.get('/:id', patientController.getById);

// Escritura: SUPER_ADMIN, OWNER y SECRETARY pueden crear/editar pacientes
router.put('/:id', requireRole('SUPER_ADMIN', 'OWNER', 'SECRETARY'), patientController.update);
// Delete: solo SUPER_ADMIN y OWNER
router.delete('/:id', requireRole('SUPER_ADMIN', 'OWNER'), patientController.delete);

export default router;
