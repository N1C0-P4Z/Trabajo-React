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

  // ARCO: Export all user data (Art. 14 Ley 25.326)
  async exportMyData() {
    const response = await fetch(`${API_URL}/users/me/data`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al exportar datos');
    }

    return response.json();
  },

  // ARCO: Request account deletion (Art. 16 Ley 25.326)
  async deleteMyAccount() {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar cuenta');
    }

    return response.json();
  },

  // Photo upload for DENTIST role (multipart/form-data)
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

  // Helper function to check if user is authenticated
  // Note: This is a synchronous check of local state
  // The actual validation happens on the server with each request
  isAuthenticated(user) {
    return user !== null && user !== undefined;
  }
};

export default authService;
