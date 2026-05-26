import { API_BASE } from './apiConfig';
const API_URL = `${API_BASE}/v1/appointments`;

const appointmentService = {
  async getAll(start, end) {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener turnos');
    }

    return await response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener el turno');
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
      throw new Error(errorData.error || 'Error al crear el turno');
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
      throw new Error(errorData.error || 'Error al actualizar el turno');
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
      throw new Error(errorData.error || 'Error al eliminar el turno');
    }

    return await response.json();
  },
};

export default appointmentService;
