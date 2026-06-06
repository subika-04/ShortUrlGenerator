import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('snip_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('snip_token');
    localStorage.removeItem('snip_user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('snip_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      try {
        const user= localStorage.getItem('snip_user');
        setUser(user);
        setToken(storedToken);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('snip_token', data.token);
    localStorage.setItem('snip_user',data.user);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post('/api/auth/signup', { name, email, password });
    localStorage.setItem('snip_user',data.user);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
