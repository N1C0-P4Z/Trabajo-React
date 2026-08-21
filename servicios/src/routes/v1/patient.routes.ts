import { Router } from 'express';
import { patientController } from '../../controllers/patient.controller';
import { authenticateToken } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/role';
import { audit } from '../../middlewares/audit';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Lectura: cualquier usuario autenticado
router.get('/', audit({ action: 'READ', resource: 'patient' }), patientController.list);
router.get('/:id', audit({ action: 'READ', resource: 'patient', resourceIdParam: 'id' }), patientController.getById);

// Escritura: staff o el propio paciente
router.put('/:id', authenticateToken, audit({ action: 'UPDATE', resource: 'patient', resourceIdParam: 'id' }), patientController.update);
// Delete: solo SUPER_ADMIN y OWNER
router.delete('/:id', requireRole('SUPER_ADMIN', 'OWNER'), audit({ action: 'DELETE', resource: 'patient', resourceIdParam: 'id' }), patientController.delete);

export default router;
