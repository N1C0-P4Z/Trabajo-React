import { Request, Response, NextFunction } from 'express';
import { RECAPTCHA_SECRET } from '../config/security';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Middleware that verifies reCAPTCHA v2 token from request body.
 * Token is expected in `req.body.recaptchaToken`.
 * Skips verification when RECAPTCHA_SECRET is empty (DEV mode).
 * Returns 400 on missing or invalid token.
 */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip CAPTCHA in DEV when no secret is configured
  if (!RECAPTCHA_SECRET) {
    next();
    return;
  }

  const token = req.body.recaptchaToken;

  if (!token) {
    res.status(400).json({ error: 'reCAPTCHA verification failed' });
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (!data.success) {
      res.status(400).json({ error: 'reCAPTCHA verification failed' });
      return;
    }

    next();
  } catch (error) {
    res.status(400).json({ error: 'reCAPTCHA verification failed' });
  }
};
