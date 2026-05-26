import { Request, Response, NextFunction } from 'express';
import { appointmentTypeService } from '../services/appointment-type.service';

export const appointmentTypeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await appointmentTypeService.getAll();
      res.json(types);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const type = await appointmentTypeService.getById(id);
      res.json(type);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = (req as any).user?.role;
      const data = req.body;
      const type = await appointmentTypeService.create(data, userRole);
      res.status(201).json(type);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const updated = await appointmentTypeService.update(id, req.body, userRole);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const result = await appointmentTypeService.delete(id, userRole);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
