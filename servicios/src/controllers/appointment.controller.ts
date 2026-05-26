import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';

export const appointmentController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        res.status(400).json({ error: 'Los parámetros start y end son requeridos' });
        return;
      }

      const appointments = await appointmentService.getByRange(
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
