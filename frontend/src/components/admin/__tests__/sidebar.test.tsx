import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../sidebar';
import { useAuth } from '../../../hooks/use-auth';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuth.setState({
      token: 'token',
      user: { email: 'admin@admin.com', name: 'Administrador' },
      isAuthenticated: true,
    });
  });

  it('should render navigation links for Dashboard and Leads', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute(
      'href',
      '/admin/dashboard'
    );
    expect(screen.getByText('Leads').closest('a')).toHaveAttribute(
      'href',
      '/admin/leads'
    );
  });

  it('should highlight the active menu item', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard').closest('a')).toHaveClass('bg-blue-100');
    expect(screen.getByText('Leads').closest('a')).not.toHaveClass('bg-blue-100');
  });

  it('should show the admin email and logout button', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('admin@admin.com')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('should call logout when clicking Sair', () => {
    const logoutSpy = vi.spyOn(useAuth.getState(), 'logout');

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Sair'));
    expect(logoutSpy).toHaveBeenCalled();
  });
});
