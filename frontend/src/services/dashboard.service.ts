import api from './api';
import { Product } from '@/types/product';
import { Sale } from '@/types/sale';

export type DashboardStats = {
  todaySales: number;
  todayProfit: number;
  todaySalesCount: number;
  monthlySales: number;
  monthlyProfit: number;
  monthlySalesCount: number;
  activeProducts: number;
  lowStockProducts: number;
  lowStockItems: Product[];
  topProducts: Array<{
    product?: Product;
    quantity: number;
    profit: number;
    salesLines: number;
  }>;
  recentSales: Sale[];
  salesLast7Days: Array<{
    date: string;
    total: number;
    profit: number;
    count: number;
  }>;
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard');
    return data;
  },
};
