import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, first_name, last_name, phone, password, role } = req.body;

      const newUser = await userService.register({
        username,
        email,
        first_name,
        last_name,
        phone,
        password,
        role
      });

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUserId = (req as any).user ? (req as any).user.userId : null;

      const updated = await userService.updateUser(id, req.body, requestingUserId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
