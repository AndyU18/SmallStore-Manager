import api from './api';
import { Sale } from '@/types/sale';

type CreateSalePayload = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    const { data } = await api.get('/sales');
    return data;
  },
  create: async (sale: CreateSalePayload) => {
    const { data } = await api.post('/sales', sale);
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await api.post(`/sales/${id}/cancel`);
    return data;
  },
};
