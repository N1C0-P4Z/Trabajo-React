const { authService } = require('../services/auth.service');

const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      const { token, user } = await authService.login(username, password);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Return user data
      res.json(user);

    } catch (error) {
      next(error);
    }
  },

  logout(req, res) {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Logged out successfully' });
  },

  async me(req, res, next) {
    try {
      const token = req.cookies.token;

      const user = await authService.getUserFromToken(token);

      res.json(user);

    } catch (error) {
      next(error);
    }
  }
};

module.exports = { authController };
