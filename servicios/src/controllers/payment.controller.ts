import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export const paymentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        patient_id,
        status,
        payment_method,
        desde,
        hasta,
        pagina = '1',
        limite = '10',
      } = req.query;

      const filters = {
        search: search as string | undefined,
        patient_id: patient_id ? Number(patient_id) : undefined,
        status: status as string | undefined,
        payment_method: payment_method as string | undefined,
        desde: desde as string | undefined,
        hasta: hasta as string | undefined,
        pagina: Number(pagina) || 1,
        limite: Number(limite) || 10,
      };

      const result = await paymentService.listPayments(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const requestingUser = (req as any).user
        ? { userId: (req as any).user.userId, role: (req as any).user.role }
        : null;

      const payment = await paymentService.createPayment(req.body, requestingUser);
      res.status(201).json(payment);
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

      const payment = await paymentService.updatePayment(id, req.body, requestingUser);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const { pagina = '1', limite = '10' } = req.query;
      const userId = (req as any).user.userId;

      const result = await paymentService.listMine(userId, {
        pagina: Number(pagina) || 1,
        limite: Number(limite) || 10,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getReceiptPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUser = {
        userId: (req as any).user.userId,
        role: (req as any).user.role,
      };

      const { buffer, filename } = await paymentService.getReceiptPdf(id, requestingUser);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};
