import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config/security';

/**
 * Rate limiter for authentication endpoints.
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars.
 * Returns 429 with X-RateLimit-* headers when limit is exceeded.
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: 'draft-6', // X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  legacyHeaders: true,        // Also send X-RateLimit-* legacy headers
  message: {
    error: 'Too many requests. Please try again later.',
  },
  statusCode: 429,
});
