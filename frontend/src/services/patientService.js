import { API_BASE } from './apiConfig';
const PATIENTS_URL = `${API_BASE}/v1/patients`;

const patientService = {
  /**
   * List patients with optional filters and pagination.
   * @param {Object} filters — { search, obra_social, doctor_id, desde, hasta, estado, pagina, limite }
   * @returns {Promise<{ data: Array, total: number, pagina: number, limite: number }>}
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.obra_social) params.append('obra_social', filters.obra_social);
    if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
    if (filters.desde) params.append('desde', filters.desde);
    if (filters.hasta) params.append('hasta', filters.hasta);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.pagina) params.append('pagina', filters.pagina);
    if (filters.limite) params.append('limite', filters.limite);

    const qs = params.toString();
    const url = qs ? `${PATIENTS_URL}?${qs}` : PATIENTS_URL;

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener pacientes');
    }

    return await response.json();
  },

  /**
   * Get a single patient by ID (includes user data + computed visit fields).
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await fetch(`${PATIENTS_URL}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener paciente');
    }

    return await response.json();
  },

  /**
   * Update a patient profile.
   * @param {number|string} id
   * @param {Object} data — { dni, obra_social, numero_afiliado, fecha_nacimiento, direccion, telefono_alternativo, is_active }
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const response = await fetch(`${PATIENTS_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar paciente');
    }

    return await response.json();
  },

  /**
   * Soft-delete (deactivate) a patient profile.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const response = await fetch(`${PATIENTS_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar paciente');
    }

    return await response.json();
  },
};

export default patientService;
