import { comparePassword } from '../utils/bcrypt';
import { generateToken, verifyToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { isEmailVerified } from './email-verification.service';

export const authService = {
  async login(credentials: string, password: string) {
    if (!credentials || !password) {
      throw new Error('Username/email and password are required');
    }

    let user = await userRepository.findByUsername(credentials) as any;

    if (!user) {
      user = await userRepository.findByEmail(credentials) as any;
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Solo si hay verificación de email real habilitada (no hay SMTP todavía)
    if (process.env.ENABLE_EMAIL_VERIFICATION === 'true') {
      const verified = await isEmailVerified(user.id);
      if (!verified) {
        throw new Error('Email no verificado. Revisá tu bandeja de entrada.');
      }
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        specialty: user.specialty,
        license_number: user.license_number,
        dni: user.dni,
        direccion: user.direccion,
      }
    };
  },

  async getUserFromToken(token: string) {
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
