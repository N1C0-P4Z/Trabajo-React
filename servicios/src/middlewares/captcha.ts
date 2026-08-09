import { Request, Response, NextFunction } from 'express';
import { RECAPTCHA_SECRET } from '../config/security';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/** Verifica reCAPTCHA v2. Si no hay RECAPTCHA_SECRET, se omite (desarrollo). */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!RECAPTCHA_SECRET) {
    next();
    return;
  }

  const token = req.body.captchaToken || req.body.recaptchaToken;

  if (!token) {
    res.status(400).json({ error: 'Completá el captcha para continuar' });
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);
    if (req.ip) {
      params.append('remoteip', req.ip);
    }

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA verify failed:', data['error-codes'] || data);
      res.status(400).json({ error: 'Falló la verificación de reCAPTCHA' });
      return;
    }

    next();
  } catch (err) {
    console.error('reCAPTCHA verify error:', err);
    res.status(400).json({ error: 'Falló la verificación de reCAPTCHA' });
  }
};
