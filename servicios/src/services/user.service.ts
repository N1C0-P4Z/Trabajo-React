import { hashPassword, comparePassword } from '../utils/bcrypt';
import { userRepository } from '../repositories/user.repository';
import { patientRepository } from '../repositories/patient.repository';
import { AppError } from '../utils/errors';
import { generateVerificationToken } from './email-verification.service';
import { prisma } from '../config/database';

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

export const VALID_ROLES = [
  'SUPER_ADMIN',
  'OWNER',
  'DENTIST',
  'SECRETARY',
  'PATIENT'
] as const;

export type ValidRole = typeof VALID_ROLES[number];

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
    throw new AppError('Completá tu correo electrónico', 400, 'email');
  }

  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed)) {
    throw new AppError('El formato del email no es válido', 400, 'email');
  }

  return trimmed;
}

function validatePhone(phone: string, countryCode: string = 'AR'): string {
  if (!phone || typeof phone !== 'string') {
    throw new AppError('Completá tu teléfono', 400, 'phone');
  }

  const trimmed = phone.trim();
  const validator = countryPhoneValidators[countryCode];

  if (!validator) {
    throw new AppError(`País no soportado: ${countryCode}`, 400, 'phone');
  }

  if (!validator.regex.test(trimmed)) {
    throw new AppError('Formato de teléfono inválido. Ej: +54 9 11 1234-5678', 400, 'phone');
  }

  return trimmed;
}

function validateUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    throw new AppError('Completá tu nombre de usuario', 400, 'username');
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    throw new AppError('Mínimo 3 caracteres', 400, 'username');
  }

  if (trimmed.length > 30) {
    throw new AppError('Máximo 30 caracteres', 400, 'username');
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    throw new AppError('Solo letras, números, puntos y guiones', 400, 'username');
  }

  return trimmed;
}

function validateName(name: string, field: string = 'nombre', fieldKey: string = 'first_name'): string {
  if (!name || typeof name !== 'string') {
    throw new AppError(`Completá tu ${field}`, 400, fieldKey);
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    throw new AppError(`Mínimo 2 caracteres`, 400, fieldKey);
  }

  if (trimmed.length > 50) {
    throw new AppError(`Máximo 50 caracteres`, 400, fieldKey);
  }

  return trimmed;
}

function validatePassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new AppError('Completá tu contraseña', 400, 'password');
  }

  if (password.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400, 'password');
  }

  if (!/[A-Z]/.test(password)) {
    throw new AppError('La contraseña debe contener al menos una letra mayúscula', 400, 'password');
  }

  if (!/[a-z]/.test(password)) {
    throw new AppError('La contraseña debe contener al menos una letra minúscula', 400, 'password');
  }

  if (!/[0-9]/.test(password)) {
    throw new AppError('La contraseña debe contener al menos un número', 400, 'password');
  }

  return password;
}

function validateSpecialty(specialty: string): string {
  if (!specialty || typeof specialty !== 'string') {
    throw new AppError('Seleccioná una especialidad', 400, 'specialty');
  }

  const trimmed = specialty.trim();

  if (!SPECIALTIES.includes(trimmed as any)) {
    throw new AppError('La especialidad no es válida', 400, 'specialty');
  }

  return trimmed;
}

async function validateLicenseNumber(license: string, excludeUserId?: number): Promise<string> {
  if (!license || typeof license !== 'string') {
    throw new AppError('Completá el número de matrícula', 400, 'license_number');
  }

  const trimmed = license.trim();

  const existing = await userRepository.findByLicenseNumber(trimmed);
  if (existing && (!excludeUserId || (existing as any).id !== excludeUserId)) {
    throw new AppError('La matrícula ya está registrada', 409, 'license_number');
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
    dni?: string;
    obra_social?: string;
    numero_afiliado?: string;
    contacto_emergencia?: string;
    telefono_emergencia?: string;
    alergias?: string;
    notas?: string;
  }) {
    const { email, first_name, last_name, phone, password } = data;

    const validUsername = validateUsername(data.username);
    const validEmail = validateEmail(email);
    const validFirstName = validateName(first_name, 'nombre', 'first_name');
    const validLastName = validateName(last_name, 'apellido', 'last_name');
    const validPhone = validatePhone(phone, 'AR');
    const validPassword = validatePassword(password);

    const existingUsername = await userRepository.findByUsername(validUsername);
    if (existingUsername) {
      throw new AppError('El nombre de usuario no está disponible', 409, 'username');
    }

    const existingEmail = await userRepository.findByEmail(validEmail);
    if (existingEmail) {
      throw new AppError('El email ya está registrado', 409, 'email');
    }

    const users = await userRepository.findAll();
    const existingPhone = users.find((u: any) => u.phone === validPhone);
    if (existingPhone) {
      throw new AppError('El teléfono ya está registrado', 409, 'phone');
    }

    // Validar DNI si se provee (para role PATIENT)
    if (data.dni?.trim()) {
      const existingDni = await patientRepository.findByDni(data.dni.trim());
      if (existingDni) {
        throw new AppError('El DNI ya está registrado', 409, 'dni');
      }
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

    // Auto-crear PatientProfile si el rol es PATIENT
    if (newUser.role === 'PATIENT') {
      const dni = data.dni?.trim() || `PENDIENTE-${newUser.id}`;
      await patientRepository.create({
        user_id: newUser.id,
        dni,
        obra_social: data.obra_social?.trim() || null,
        numero_afiliado: data.numero_afiliado?.trim() || null,
        contacto_emergencia: data.contacto_emergencia?.trim() || null,
        telefono_emergencia: data.telefono_emergencia?.trim() || null,
        alergias: data.alergias?.trim() || null,
        notas: data.notas?.trim() || null,
      });
    }

    // Generate email verification token (auto-verifies in DEV, generates token in PROD)
    await generateVerificationToken(newUser.id);

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

    // Password change
    if (data.new_password !== undefined && data.new_password !== null && data.new_password !== '') {
      const currentPassword = data.current_password;
      if (!currentPassword) {
        throw new AppError('Debés ingresar tu contraseña actual', 400, 'current_password');
      }

      const userWithPassword = await userRepository.findByIdWithPassword(userId);
      if (!userWithPassword?.password_hash) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const isValid = await comparePassword(currentPassword, userWithPassword.password_hash);
      if (!isValid) {
        throw new AppError('La contraseña actual no es correcta', 400, 'current_password');
      }

      // Apply same complexity rules as registration
      validatePassword(data.new_password);

      updateData.password_hash = await hashPassword(data.new_password);
    }

    if (data.first_name !== undefined) {
      updateData.first_name = validateName(data.first_name, 'nombre', 'first_name');
    }

    if (data.last_name !== undefined) {
      updateData.last_name = validateName(data.last_name, 'apellido', 'last_name');
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

    if (data.role !== undefined) {
      const validRoles: string[] = [...VALID_ROLES];
      if (!validRoles.includes(data.role)) {
        throw new AppError(`Rol inválido. Roles permitidos: ${validRoles.join(', ')}`, 400, 'role');
      }
      updateData.role = data.role;
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
      throw new AppError('ID de usuario inválido', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Self-deletion guard: a user cannot delete their own account
    if (requestingUser && requestingUser.userId === userId) {
      throw new AppError('No podés eliminar tu propia cuenta', 403);
    }

    // Last SUPER_ADMIN guard: cannot delete the last SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN') {
      const superAdminCount = await userRepository.countByRole('SUPER_ADMIN');
      if (superAdminCount <= 1) {
        throw new AppError('No se puede eliminar al último SUPER_ADMIN del sistema', 403);
      }
    }

    // OWNER accounts cannot be deleted
    if (user.role === 'OWNER') {
      throw new AppError('No se puede eliminar al administrador del sistema', 403);
    }

    // Only SUPER_ADMIN and OWNER roles can delete users
    if (!requestingUser || (requestingUser.role !== 'SUPER_ADMIN' && requestingUser.role !== 'OWNER')) {
      throw new AppError('No autorizado para eliminar usuarios', 403);
    }

    await userRepository.delete(userId);
    return { message: 'Usuario eliminado exitosamente' };
  },

  getSpecialties() {
    return [...SPECIALTIES];
  },

  /**
   * ARCO: Export all user data (Access right).
   * Returns user profile + patient data (if PATIENT) + appointments + payments.
   * NEVER includes password_hash, tokens, or internal IDs of other users.
   */
  async exportUserData(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const result: any = { user };

    // If PATIENT, include patient profile
    if (user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { user_id: userId },
        select: {
          dni: true,
          obra_social: true,
          numero_afiliado: true,
          fecha_nacimiento: true,
          direccion: true,
          telefono_alternativo: true,
          contacto_emergencia: true,
          telefono_emergencia: true,
          alergias: true,
          notas: true,
        },
      });
      result.patient = patient;
    }

    // Appointments for this user (as patient or doctor)
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ patient_id: userId }, { doctor_id: userId }],
      },
      select: {
        id: true,
        datetime: true,
        duration_minutes: true,
        status: true,
        notes: true,
        type: { select: { name: true } },
      },
      orderBy: { datetime: 'desc' },
    });
    result.appointments = appointments;

    // Payments for this user (as patient)
    const payments = await prisma.payment.findMany({
      where: { patient_id: userId },
      select: {
        id: true,
        amount: true,
        payment_method: true,
        status: true,
        notes: true,
        paid_at: true,
      },
      orderBy: { paid_at: 'desc' },
    });
    result.payments = payments;

    return result;
  },

  /**
   * ARCO: Delete user account (Cancellation right).
   * Soft-delete: sets is_active=false, purges PII, preserves relational records.
   * Uses a Prisma transaction for atomicity.
   */
  async deleteUserAccount(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await prisma.$transaction(async (tx) => {
      // Anonymize PII on User
      await tx.user.update({
        where: { id: userId },
        data: {
          is_active: false,
          email: `ANONYMIZED-${userId}@deleted.local`,
          first_name: 'DELETED',
          last_name: 'USER',
          phone: '',
          username: `deleted-${userId}`,
          password_hash: 'DELETED',
          specialty: null,
          license_number: null,
          avatar_url: null,
        },
      });

      // Anonymize PII on Patient if exists
      if (user.patient) {
        await tx.patient.update({
          where: { user_id: userId },
          data: {
            dni: `DELETED-${userId}`,
            obra_social: null,
            numero_afiliado: null,
            fecha_nacimiento: null,
            direccion: null,
            telefono_alternativo: null,
            contacto_emergencia: null,
            telefono_emergencia: null,
            alergias: null,
            notas: null,
          },
        });
      }
      // Appointments and payments are preserved for audit
    });

    return { message: 'Cuenta eliminada exitosamente' };
  },

  /**
   * Update user's avatar_url after secure upload pipeline validates the file.
   */
  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
      },
    });

    return updated;
  }
};
