import api from './api';
import { Product } from '@/types/product';

export type ProductPayload = {
  name: string;
  sku: string;
  description?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  categoryId: string;
};

export const productsService = {
  getAll: async (params?: { search?: string; categoryId?: string; lowStock?: boolean }): Promise<Product[]> => {
    const { data } = await api.get('/products', { params });
    return data;
  },
  create: async (product: ProductPayload) => {
    const { data } = await api.post('/products', product);
    return data;
  },
  update: async (id: string, product: Partial<ProductPayload>) => {
    const { data } = await api.put(`/products/${id}`, product);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};
