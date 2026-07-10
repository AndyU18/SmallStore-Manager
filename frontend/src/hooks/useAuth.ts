import { useState } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types/user';

type Credentials = {
  email: string;
  password: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }
    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (credentials: Credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
