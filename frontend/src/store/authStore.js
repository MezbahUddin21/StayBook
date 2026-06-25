import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set, get) => ({
  user:      null,
  token:     localStorage.getItem('token'),
  isLoading: false,
  error:     null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/register', payload);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/me');
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  updateProfile: async (payload) => {
    const { data } = await api.put('/me', payload);
    set({ user: data });
    return data;
  },
}));
