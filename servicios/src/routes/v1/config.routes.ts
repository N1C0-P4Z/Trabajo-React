import { Router, Request, Response } from 'express';
import { RECAPTCHA_SITE_KEY } from '../../config/security';

const router = Router();

/** Config pública (sin auth). La site key de reCAPTCHA es pública por diseño. */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    recaptchaSiteKey: RECAPTCHA_SITE_KEY || '',
  });
});

export default router;
