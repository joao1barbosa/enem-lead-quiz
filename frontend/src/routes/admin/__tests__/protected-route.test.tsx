import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../protected-route';
import { useAuth } from '../../../hooks/use-auth';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ token: null, user: null, isAuthenticated: false });
  });

  it('should render children when authenticated', () => {
    useAuth.setState({ token: 'token', isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Painel Admin</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
  });

  it('should redirect to /admin/login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Painel Admin</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
  });
});
