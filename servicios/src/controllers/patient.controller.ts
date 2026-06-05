import { Request, Response, NextFunction } from 'express';
import { patientService } from '../services/patient.service';

export const patientController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        obra_social,
        doctor_id,
        desde,
        hasta,
        estado,
        pagina = '1',
        limite = '10'
      } = req.query;

      const filters = {
        search: search as string | undefined,
        obra_social: obra_social as string | undefined,
        doctor_id: doctor_id ? Number(doctor_id) : undefined,
        desde: desde as string | undefined,
        hasta: hasta as string | undefined,
        estado: estado as string | undefined,
        pagina: Number(pagina) || 1,
        limite: Number(limite) || 10
      };

      const result = await patientService.listPatients(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patient = await patientService.getPatientById(id);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUser = (req as any).user
        ? { userId: (req as any).user.userId, role: (req as any).user.role }
        : null;

      const updated = await patientService.updatePatient(id, req.body, requestingUser);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUser = (req as any).user
        ? { userId: (req as any).user.userId, role: (req as any).user.role }
        : null;

      const result = await patientService.deletePatient(id, requestingUser);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
