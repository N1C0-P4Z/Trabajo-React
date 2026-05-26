import { API_BASE } from './apiConfig';
const API_URL = `${API_BASE}/v1/appointment-types`;

const appointmentTypeService = {
  async getAll() {
    const response = await fetch(API_URL, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener tipos de turno');
    }

    return await response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener el tipo de turno');
    }

    return await response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear tipo de turno');
    }

    return await response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar tipo de turno');
    }

    return await response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar tipo de turno');
    }

    return await response.json();
  },
};

export default appointmentTypeService;
