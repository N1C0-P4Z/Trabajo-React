import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export const receiptController = {
  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      const { buffer, filename } = await paymentService.getReceiptPdfByToken(token);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};
