const { comparePassword } = require('../utils/bcrypt');
const { generateToken, verifyToken } = require('../utils/jwt');
const { userRepository } = require('../repositories/user.repository');

const authService = {
  async login(credentials, password) {
    if (!credentials || !password) {
      throw new Error('Username/email and password are required');
    }

    // Buscar por username O email
    let user = await userRepository.findByUsername(credentials);
    
    if (!user) {
      user = await userRepository.findByEmail(credentials);
    }

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
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
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
