import api from './api';
import { User } from '@/types/user';

type Credentials = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  user: User;
};

export const authService = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
