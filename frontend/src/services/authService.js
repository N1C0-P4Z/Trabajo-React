import { API_BASE } from './apiConfig';
const API_URL = `${API_BASE}/v1`;

export class FieldError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'FieldError';
    this.field = field || null;
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      response.status >= 500
        ? 'El servidor no está disponible. Probá de nuevo más tarde.'
        : 'Respuesta inválida del servidor'
    );
  }
}

export const authService = {
  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await readJson(response);
      throw new FieldError(
        data.error || 'Error al registrarse',
        data.field || null
      );
    }

    return readJson(response);
  },

  async login(username, password, captchaToken) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, captchaToken }),
    });

    if (!response.ok) {
      const error = await readJson(response);
      throw new Error(error.error || 'Login failed');
    }

    return readJson(response);
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await readJson(response);
      throw new Error(error.error || 'Logout failed');
    }

    return readJson(response);
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Failed to get user');
    }

    return readJson(response);
  },

  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_URL}/users/me/photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await readJson(response);
      throw new Error(error.error || 'Error al subir foto');
    }

    return readJson(response);
  },

  isAuthenticated(user) {
    return user !== null && user !== undefined;
  }
};

export default authService;
