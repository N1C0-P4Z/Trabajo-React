import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service';

export const statsController = {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
};