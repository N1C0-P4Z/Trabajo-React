import { hashPassword } from '../utils/bcrypt';
import { userRepository } from '../repositories/user.repository';

// ============================================================
// VALIDADORES EXPANDIBLES
// ============================================================

interface PhoneValidator {
  regex: RegExp;
  message: string;
}

const countryPhoneValidators: Record<string, PhoneValidator> = {
  AR: {
    regex: /^\+?54\s?(?:9\s?)?\d{2,4}\s?\d{4}[\s-]?\d{4}$/,
    message: 'Formato argentino inválido. Ej: +54 9 11 1234-5678'
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('El email es requerido');
  }

  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed)) {
    throw new Error('Formato de email inválido');
  }

  return trimmed;
}

function validatePhone(phone: string, countryCode: string = 'AR'): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('El teléfono es requerido');
  }

  const trimmed = phone.trim();
  const validator = countryPhoneValidators[countryCode];

  if (!validator) {
    throw new Error(`País no soportado: ${countryCode}`);
  }

  if (!validator.regex.test(trimmed)) {
    throw new Error(validator.message);
  }

  return trimmed;
}

function validateUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    throw new Error('El nombre de usuario es requerido');
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
  }

  if (trimmed.length > 30) {
    throw new Error('El nombre de usuario no puede tener más de 30 caracteres');
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    throw new Error('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos');
  }

  return trimmed;
}

function validateName(name: string, field: string = 'nombre'): string {
  if (!name || typeof name !== 'string') {
    throw new Error(`El ${field} es requerido`);
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    throw new Error(`El ${field} debe tener al menos 2 caracteres`);
  }

  if (trimmed.length > 50) {
    throw new Error(`El ${field} no puede tener más de 50 caracteres`);
  }

  return trimmed;
}

function validatePassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña es requerida');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  return password;
}

// ============================================================
// SERVICIO DE USUARIOS
// ============================================================

export const userService = {
  async register(data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    const { email, first_name, last_name, phone, password } = data;

    const validUsername = validateUsername(data.username);
    const validEmail = validateEmail(email);
    const validFirstName = validateName(first_name, 'nombre');
    const validLastName = validateName(last_name, 'apellido');
    const validPhone = validatePhone(phone, 'AR');
    const validPassword = validatePassword(password);

    const existingUsername = await userRepository.findByUsername(validUsername);
    if (existingUsername) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    const existingEmail = await userRepository.findByEmail(validEmail);
    if (existingEmail) {
      throw new Error('El email ya está en uso');
    }

    const users = await userRepository.findAll();
    const existingPhone = users.find((u: any) => u.phone === validPhone);
    if (existingPhone) {
      throw new Error('El número de teléfono ya está en uso');
    }

    const password_hash = await hashPassword(validPassword);

    const newUser = await userRepository.create({
      username: validUsername,
      email: validEmail,
      first_name: validFirstName,
      last_name: validLastName,
      phone: validPhone,
      password_hash,
      role: data.role || 'PATIENT'
    });

    return newUser;
  },

  async getAllUsers() {
    return await userRepository.findAll();
  },

  async getUserById(id: string | number) {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (!numId || isNaN(numId)) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(numId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  },

  async updateUser(id: string | number, data: any, requestingUserId: number | null = null) {
    const userId = typeof id === 'string' ? parseInt(id) : id;
    if (!userId || isNaN(userId)) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (requestingUserId && requestingUserId !== userId) {
      throw new Error('No autorizado para editar este usuario');
    }

    const updateData: any = {};

    if (data.first_name !== undefined) {
      updateData.first_name = validateName(data.first_name, 'nombre');
    }

    if (data.last_name !== undefined) {
      updateData.last_name = validateName(data.last_name, 'apellido');
    }

    if (data.phone !== undefined) {
      updateData.phone = validatePhone(data.phone, 'AR');

      if (updateData.phone) {
        const users = await userRepository.findAll();
        const existingPhone = users.find((u: any) => u.phone === updateData.phone && u.id !== userId);
        if (existingPhone) {
          throw new Error('El número de teléfono ya está en uso');
        }
      }
    }

    if (data.email !== undefined) {
      updateData.email = validateEmail(data.email);

      const existingEmail = await userRepository.findByEmail(updateData.email);
      if (existingEmail && (existingEmail as any).id !== userId) {
        throw new Error('El email ya está en uso');
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    const updated = await userRepository.update(userId, updateData);
    return updated;
  },

  async deleteUser(id: string | number) {
    const userId = typeof id === 'string' ? parseInt(id) : id;
    if (!userId || isNaN(userId)) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await userRepository.delete(userId);
    return { message: 'Usuario eliminado exitosamente' };
  }
};
