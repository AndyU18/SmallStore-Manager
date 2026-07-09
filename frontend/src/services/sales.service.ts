import api from './api';

export const salesService = {
  getAll: async () => {
    const { data } = await api.get('/sales');
    return data;
  },
  create: async (sale: any) => {
    const { data } = await api.post('/sales', sale);
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await api.post(`/sales/${id}/cancel`);
    return data;
  },
};
