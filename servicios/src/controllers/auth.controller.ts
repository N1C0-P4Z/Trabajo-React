import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const ALLOWED_SELF_REGISTER_ROLES = ['PATIENT', 'DENTIST', 'SECRETARY'];
      const role = data.role && ALLOWED_SELF_REGISTER_ROLES.includes(data.role)
        ? data.role
        : 'PATIENT';
      const newUser = await userService.register({ ...data, role });
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const { token, user } = await authService.login(username, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/'
    });

    res.json({ message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.token;

      const user = await authService.getUserFromToken(token);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
};
