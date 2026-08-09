import { API_BASE } from './apiConfig';
const API_URL = `${API_BASE}/v1`;

export class FieldError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'FieldError';
    this.field = field || null;
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
      const data = await response.json();
      throw new FieldError(
        data.error || 'Error al registrarse',
        data.field || null
      );
    }

    return response.json();
  },

  async login(username, password, captchaToken) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify({ username, password, captchaToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }

    return response.json();
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

    return response.json();
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
      const error = await response.json();
      throw new Error(error.error || 'Error al subir foto');
    }

    return response.json();
  },

  isAuthenticated(user) {
    return user !== null && user !== undefined;
  }
};

export default authService;
