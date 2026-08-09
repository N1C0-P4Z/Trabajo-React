import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config/security';

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: 'draft-6',
  legacyHeaders: true,
  message: {
    error: 'Demasiados intentos. Probá de nuevo más tarde.',
  },
  statusCode: 429,
});

/** En desarrollo no limita. En producción aplica RATE_LIMIT_* del .env */
export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    next();
    return;
  }
  return limiter(req, res, next);
};
