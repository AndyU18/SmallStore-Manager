import api from './api';

export const productsService = {
  getAll: async () => {
    const { data } = await api.get('/products');
    return data;
  },
  create: async (product: any) => {
    const { data } = await api.post('/products', product);
    return data;
  },
  update: async (id: string, product: any) => {
    const { data } = await api.put(`/products/${id}`, product);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};
