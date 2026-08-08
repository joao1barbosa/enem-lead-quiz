import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../use-auth';
import * as api from '../../lib/api';

const buildToken = (payload: Record<string, unknown>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ token: null, user: null, isAuthenticated: false });
    delete api.api.defaults.headers.common['Authorization'];
    vi.restoreAllMocks();
  });

  it('should start unauthenticated', () => {
    expect(useAuth.getState().isAuthenticated).toBe(false);
    expect(useAuth.getState().token).toBeNull();
    expect(useAuth.getState().user).toBeNull();
  });

  it('should store token and decoded user on login', async () => {
    const token = buildToken({ sub: 'admin-id', email: 'admin@admin.com' });
    vi.spyOn(api.api, 'post').mockResolvedValue({ data: { access_token: token } });

    await useAuth.getState().login('admin@admin.com', 'admin123');

    const state = useAuth.getState();
    expect(api.api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123',
    });
    expect(state.token).toBe(token);
    expect(state.user).toEqual({ email: 'admin@admin.com' });
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set the Authorization header after login', async () => {
    const token = buildToken({ sub: 'admin-id', email: 'admin@admin.com' });
    vi.spyOn(api.api, 'post').mockResolvedValue({ data: { access_token: token } });

    await useAuth.getState().login('admin@admin.com', 'admin123');

    expect(api.api.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
  });

  it('should clear token, user and header on logout', async () => {
    const token = buildToken({ sub: 'admin-id', email: 'admin@admin.com' });
    vi.spyOn(api.api, 'post').mockResolvedValue({ data: { access_token: token } });

    await useAuth.getState().login('admin@admin.com', 'admin123');
    useAuth.getState().logout();

    const state = useAuth.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(api.api.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
