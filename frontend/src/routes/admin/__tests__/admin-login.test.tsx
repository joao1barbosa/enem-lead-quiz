import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLogin } from '../admin-login';

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should render email and password fields', () => {
    renderLogin();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInvalid();
      expect(screen.getByLabelText('Senha')).toBeInvalid();
    });
  });

  it('should call login and redirect to dashboard on success', async () => {
    const useAuthModule = await import('../../../hooks/use-auth');
    const loginSpy = vi.spyOn(useAuthModule.useAuth.getState(), 'login');
    loginSpy.mockResolvedValue();

    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@admin.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'admin123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('admin@admin.com', 'admin123');
    });
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('should show an error message when credentials are invalid', async () => {
    const useAuthModule = await import('../../../hooks/use-auth');
    const loginSpy = vi.spyOn(useAuthModule.useAuth.getState(), 'login');
    loginSpy.mockRejectedValue(new Error('Credenciais inválidas.'));

    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@admin.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha-errada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText('Credenciais inválidas. Tente novamente.')
    ).toBeInTheDocument();
  });
});
