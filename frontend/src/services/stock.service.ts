import api from './api';

export const stockService = {
  getAll: async (params?: { productId?: string; type?: string }) => {
    const { data } = await api.get('/stock-movements', { params });
    return data;
  },
  adjust: async (adjustment: {
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    reason: string;
  }) => {
    const { data } = await api.post('/stock-movements/adjust', adjustment);
    return data;
  },
};
