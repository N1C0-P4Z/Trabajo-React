import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';

export const appointmentController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end, patient_id, doctor_id } = req.query;

      if (!start || !end) {
        res.status(400).json({ error: 'Los parámetros start y end son requeridos' });
        return;
      }

      const patientId = patient_id ? parseInt(patient_id as string, 10) : undefined;
      const doctorId = doctor_id ? parseInt(doctor_id as string, 10) : undefined;

      if (patientId !== undefined && isNaN(patientId)) {
        res.status(400).json({ error: 'patient_id debe ser un número válido' });
        return;
      }
      if (doctorId !== undefined && isNaN(doctorId)) {
        res.status(400).json({ error: 'doctor_id debe ser un número válido' });
        return;
      }

      const appointments = await appointmentService.getByRange(
        start as string,
        end as string,
        patientId,
        doctorId
      );
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  },

  async getMyAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        res.status(400).json({ error: 'Los parámetros start y end son requeridos' });
        return;
      }

      const role = req.user?.role;
      const userId = req.user?.userId;

      if (!role || !userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const appointments = await appointmentService.getMyAppointments(
        role,
        userId,
        start as string,
        end as string
      );
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.getById(id);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.create(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await appointmentService.update(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await appointmentService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
