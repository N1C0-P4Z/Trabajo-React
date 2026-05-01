const { hashPassword } = require('../utils/bcrypt');
const { userRepository } = require('../repositories/user.repository');

// ============================================================
// VALIDADORES EXPANDIBLES
// ============================================================

const countryPhoneValidators = {
  AR: {
    name: 'Argentina',
    // +54 9 11 1234-5678 o +54 11 1234-5678 o 11 1234-5678
    regex: /^\+?54\s?(?:9\s?)?\d{2,4}\s?\d{4}[\s-]?\d{4}$/,
    message: 'Formato argentino inválido. Ej: +54 9 11 1234-5678'
  },
  // Para agregar Uruguay:
  // UY: {
  //   name: 'Uruguay',
  //   regex: /^\+?598\s?\d{2,3}\s?\d{3}[\s-]?\d{4}$/,
  //   message: 'Formato uruguayo inválido. Ej: +598 99 123 456'
  // }
};

const emailValidators = {
  // Validación general de email (RFC-like)
  general: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Formato de email inválido'
  },
  // Para agregar dominios permitidos en el futuro:
  // allowedDomains: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
  // domainRegex: /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i
};

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('El email es requerido');
  }

  const trimmed = email.trim().toLowerCase();

  if (!emailValidators.general.regex.test(trimmed)) {
    throw new Error(emailValidators.general.message);
  }

  return trimmed;
}

function validatePhone(phone, countryCode = 'AR') {
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

function validateUsername(username) {
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

function validateName(name, field = 'nombre') {
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

function validatePassword(password) {
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

const userService = {
  async register(data) {
    const { username, email, first_name, last_name, phone, password, role } = data;

    // Validaciones
    const validUsername = validateUsername(username);
    const validEmail = validateEmail(email);
    const validFirstName = validateName(first_name, 'nombre');
    const validLastName = validateName(last_name, 'apellido');
    const validPhone = validatePhone(phone, 'AR');
    const validPassword = validatePassword(password);

    // Verificar unicidad
    const existingUsername = await userRepository.findByUsername(validUsername);
    if (existingUsername) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    const existingEmail = await userRepository.findByEmail(validEmail);
    if (existingEmail) {
      throw new Error('El email ya está en uso');
    }

    // Buscar si existe otro usuario con el mismo teléfono
    const users = await userRepository.findAll();
    const existingPhone = users.find(u => u.phone === validPhone);
    if (existingPhone) {
      throw new Error('El número de teléfono ya está en uso');
    }

    // Hash de contraseña
    const password_hash = await hashPassword(validPassword);

    // Crear usuario
    const newUser = await userRepository.create({
      username: validUsername,
      email: validEmail,
      first_name: validFirstName,
      last_name: validLastName,
      phone: validPhone,
      password_hash,
      role: role || 'PATIENT'
    });

    return newUser;
  },

  async getAllUsers() {
    return await userRepository.findAll();
  },

  async getUserById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(parseInt(id));
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  },

  async updateUser(id, data, requestingUserId = null) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de usuario inválido');
    }

    const userId = parseInt(id);
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si no es admin, solo puede editar su propio perfil
    if (requestingUserId && requestingUserId !== userId) {
      // En el futuro, verificar rol aquí
      throw new Error('No autorizado para editar este usuario');
    }

    const updateData = {};

    if (data.first_name !== undefined) {
      updateData.first_name = validateName(data.first_name, 'nombre');
    }

    if (data.last_name !== undefined) {
      updateData.last_name = validateName(data.last_name, 'apellido');
    }

    if (data.phone !== undefined) {
      updateData.phone = validatePhone(data.phone, 'AR');
      
      // Verificar que no exista otro usuario con este teléfono
      if (updateData.phone) {
        const users = await userRepository.findAll();
        const existingPhone = users.find(u => u.phone === updateData.phone && u.id !== userId);
        if (existingPhone) {
          throw new Error('El número de teléfono ya está en uso');
        }
      }
    }

    if (data.email !== undefined) {
      updateData.email = validateEmail(data.email);
      
      const existingEmail = await userRepository.findByEmail(updateData.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new Error('El email ya está en uso');
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    const updated = await userRepository.update(userId, updateData);
    return updated;
  },

  async deleteUser(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de usuario inválido');
    }

    const user = await userRepository.findById(parseInt(id));
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await userRepository.delete(parseInt(id));
    return { message: 'Usuario eliminado exitosamente' };
  }
};

module.exports = { userService };
