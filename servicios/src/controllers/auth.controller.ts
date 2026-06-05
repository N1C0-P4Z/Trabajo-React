import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      // El registro público siempre crea pacientes
      const newUser = await userService.register({ ...data, role: 'PATIENT' });
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
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
