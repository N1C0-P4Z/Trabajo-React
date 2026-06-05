import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, first_name, last_name, phone, password, role, specialty, license_number, is_active, avatar_url, dni, obra_social, numero_afiliado, contacto_emergencia, telefono_emergencia, alergias, notas } = req.body;

      const newUser = await userService.register({
        username,
        email,
        first_name,
        last_name,
        phone,
        password,
        role,
        specialty,
        license_number,
        is_active,
        avatar_url,
        dni,
        obra_social,
        numero_afiliado,
        contacto_emergencia,
        telefono_emergencia,
        alergias,
        notas
      });

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string | undefined;
      const users = await userService.getAllUsers(role);
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
      const requestingUser = (req as any).user ? { userId: (req as any).user.userId, role: (req as any).user.role } : null;

      const updated = await userService.updateUser(id, req.body, requestingUser);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUser = (req as any).user; // { userId, username, role }
      const result = await userService.deleteUser(id, requestingUser);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getSpecialties(req: Request, res: Response, next: NextFunction) {
    try {
      const specialties = userService.getSpecialties();
      res.json(specialties);
    } catch (error) {
      next(error);
    }
  }
};
