import { API_BASE } from './apiConfig';

const PAYMENTS_URL = `${API_BASE}/v1/payments`;

const receiptService = {
  async getMine(filters = {}) {
    const params = new URLSearchParams();
    if (filters.pagina) params.append('pagina', filters.pagina);
    if (filters.limite) params.append('limite', filters.limite);

    const qs = params.toString();
    const url = qs ? `${PAYMENTS_URL}/mine?${qs}` : `${PAYMENTS_URL}/mine`;

    const response = await fetch(url, { credentials: 'include' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener comprobantes');
    }

    return await response.json();
  },

  async downloadPdf(id) {
    const response = await fetch(`${PAYMENTS_URL}/${id}/pdf`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al descargar comprobante');
    }

    return await response.blob();
  },
};

export default receiptService;
