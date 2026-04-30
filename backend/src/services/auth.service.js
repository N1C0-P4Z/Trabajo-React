const { comparePassword } = require('../utils/bcrypt');
const { generateToken, verifyToken } = require('../utils/jwt');
const { userRepository } = require('../repositories/user.repository');

const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  },

  async getUserFromToken(token) {
    if (!token) {
      throw new Error('Unauthorized');
    }

    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
};

module.exports = { authService };
