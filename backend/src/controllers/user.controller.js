const { userService } = require('../services/user.service');

const userController = {
  async register(req, res, next) {
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

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      // En el futuro: req.user.userId para verificar autorización
      const requestingUserId = req.user ? req.user.userId : null;
      
      const updated = await userService.updateUser(id, req.body, requestingUserId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = { userController };
