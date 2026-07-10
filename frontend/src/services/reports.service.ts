import api from './api';
import { Product } from '@/types/product';
import { Sale } from '@/types/sale';

export type ReportsResponse = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    salesCount: number;
    subtotal: number;
    total: number;
    profit: number;
  };
  sales: Sale[];
  topProducts: Array<{
    product?: Product;
    quantity: number;
    profit: number;
  }>;
  lowStockProducts: Product[];
  salesByDay: Array<{
    date: string;
    total: number;
    profit: number;
    count: number;
  }>;
};

export const reportsService = {
  getReport: async (params?: { startDate?: string; endDate?: string }): Promise<ReportsResponse> => {
    const { data } = await api.get('/reports', { params });
    return data;
  },
};
