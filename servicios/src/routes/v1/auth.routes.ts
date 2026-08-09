import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { authRateLimiter } from '../../middlewares/rate-limit';
import { verifyCaptcha } from '../../middlewares/captcha';

const router = Router();

router.post('/register', authRateLimiter, verifyCaptcha, authController.register);
router.post('/login', authRateLimiter, verifyCaptcha, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

export default router;
