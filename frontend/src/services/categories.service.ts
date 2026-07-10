import api from './api';

export const categoriesService = {
  getAll: async () => {
    const { data } = await api.get('/categories');
    return data;
  },
  create: async (category: { name: string; description?: string }) => {
    const { data } = await api.post('/categories', category);
    return data;
  },
  update: async (id: string, category: { name?: string; description?: string }) => {
    const { data } = await api.put(`/categories/${id}`, category);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};
