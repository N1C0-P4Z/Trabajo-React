import { hashPassword } from '../utils/bcrypt';
import { userRepository } from '../repositories/user.repository';

// ============================================================
// CATÁLOGO DE ESPECIALIDADES
// ============================================================

export const SPECIALTIES = [
  "Odontología General",
  "Ortodoncia",
  "Endodoncia",
  "Periodoncia",
  "Cirugía Oral y Maxilofacial",
  "Odontopediatría",
  "Rehabilitación Oral y Prostodoncia",
  "Odontología Estética (o Cosmética)",
  "Implantología",
  "Odontología Forense",
  "Patología Oral y Maxilofacial"
] as const;

export type Specialty = typeof SPECIALTIES[number];

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

function validateSpecialty(specialty: string): string {
  if (!specialty || typeof specialty !== 'string') {
    throw new Error('La especialidad es requerida');
  }

  const trimmed = specialty.trim();

  if (!SPECIALTIES.includes(trimmed as any)) {
    throw new Error('Especialidad no válida');
  }

  return trimmed;
}

async function validateLicenseNumber(license: string, excludeUserId?: number): Promise<string> {
  if (!license || typeof license !== 'string') {
    throw new Error('El número de matrícula es requerido');
  }

  const trimmed = license.trim();

  const existing = await userRepository.findByLicenseNumber(trimmed);
  if (existing && (!excludeUserId || (existing as any).id !== excludeUserId)) {
    throw new Error('El número de matrícula ya está en uso');
  }

  return trimmed;
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
    specialty?: string;
    license_number?: string;
    is_active?: boolean;
    avatar_url?: string;
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

    // Validar specialty si se provee
    if (data.specialty) {
      validateSpecialty(data.specialty);
    }

    // Validar license_number si se provee
    if (data.license_number) {
      await validateLicenseNumber(data.license_number);
    }

    const password_hash = await hashPassword(validPassword);

    const newUser = await userRepository.create({
      username: validUsername,
      email: validEmail,
      first_name: validFirstName,
      last_name: validLastName,
      phone: validPhone,
      password_hash,
      role: data.role || 'PATIENT',
      specialty: data.specialty || null,
      license_number: data.license_number || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      avatar_url: data.avatar_url || null
    });

    return newUser;
  },

  async getAllUsers(role?: string) {
    return await userRepository.findAll(role);
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

  async updateUser(id: string | number, data: any, requestingUser?: { userId: number; role: string } | null) {
    const userId = typeof id === 'string' ? parseInt(id) : id;
    if (!userId || isNaN(userId)) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // SUPER_ADMIN y OWNER pueden editar a cualquiera; el resto solo a sí mismos
    if (requestingUser) {
      const isAdmin = requestingUser.role === 'SUPER_ADMIN' || requestingUser.role === 'OWNER';
      if (!isAdmin && requestingUser.userId !== userId) {
        throw new Error('No autorizado para editar este usuario');
      }
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

    if (data.specialty !== undefined) {
      if (data.specialty === null || data.specialty === '') {
        updateData.specialty = null;
      } else {
        updateData.specialty = validateSpecialty(data.specialty);
      }
    }

    if (data.license_number !== undefined) {
      if (data.license_number === null || data.license_number === '') {
        updateData.license_number = null;
      } else {
        updateData.license_number = await validateLicenseNumber(data.license_number, userId);
      }
    }

    if (data.is_active !== undefined) {
      updateData.is_active = Boolean(data.is_active);
    }

    if (data.avatar_url !== undefined) {
      updateData.avatar_url = data.avatar_url || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    const updated = await userRepository.update(userId, updateData);
    return updated;
  },

  async deleteUser(id: string | number, requestingUser?: { userId: number; role: string }) {
    const userId = typeof id === 'string' ? parseInt(id) : id;
    if (!userId || isNaN(userId)) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Rule 1: SUPER_ADMIN and OWNER accounts are NEVER deletable
    if (user.role === 'SUPER_ADMIN' || user.role === 'OWNER') {
      throw new Error('No se puede eliminar al administrador del sistema');
    }

    // Rule 2: Only SUPER_ADMIN and OWNER roles can delete users
    if (!requestingUser || (requestingUser.role !== 'SUPER_ADMIN' && requestingUser.role !== 'OWNER')) {
      throw new Error('No autorizado para eliminar usuarios');
    }

    await userRepository.delete(userId);
    return { message: 'Usuario eliminado exitosamente' };
  },

  getSpecialties() {
    return [...SPECIALTIES];
  }
};
