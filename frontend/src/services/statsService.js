import { API_BASE } from './apiConfig';

const STATS_URL = `${API_BASE}/v1/stats`;

const statsService = {
  async getStats() {
    const response = await fetch(STATS_URL, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener estadísticas');
    }

    return await response.json();
  },
};

export default statsService;