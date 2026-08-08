import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { decodeJwtToken } from '../lib/auth';

interface AuthUser {
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const response = await api.post<{ access_token: string }>('/api/auth/login', {
          email,
          password,
        });
        const { access_token } = response.data;

        // Payload JWT contém `email` (RF-08) — usado para exibir o admin na UI
        const payload = decodeJwtToken(access_token);

        set({
          token: access_token,
          user: { email: payload.email ?? '' },
          isAuthenticated: true,
        });

        // Header padrão para as rotas protegidas /api/admin/*
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      },
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        delete api.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
      // Ao restaurar o estado do localStorage, também restaura o header
      // Authorization para que as chamadas API funcionem após reload.
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
