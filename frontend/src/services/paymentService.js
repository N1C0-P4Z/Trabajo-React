import { API_BASE } from './apiConfig';

const PAYMENTS_URL = `${API_BASE}/v1/payments`;

const paymentService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.patient_id) params.append('patient_id', filters.patient_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    if (filters.desde) params.append('desde', filters.desde);
    if (filters.hasta) params.append('hasta', filters.hasta);
    if (filters.pagina) params.append('pagina', filters.pagina);
    if (filters.limite) params.append('limite', filters.limite);

    const qs = params.toString();
    const url = qs ? `${PAYMENTS_URL}?${qs}` : PAYMENTS_URL;

    const response = await fetch(url, { credentials: 'include' });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener pagos');
    }

    return await response.json();
  },

  async getById(id) {
    const response = await fetch(`${PAYMENTS_URL}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener pago');
    }

    return await response.json();
  },

  async create(data) {
    const response = await fetch(PAYMENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar pago');
    }

    return await response.json();
  },

  async update(id, data) {
    const response = await fetch(`${PAYMENTS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar pago');
    }

    return await response.json();
  },
};

export default paymentService;
