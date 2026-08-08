import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../admin-layout';
import { useAuth } from '../../../hooks/use-auth';

const renderWithLayout = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
          <Route path="leads" element={<div>Leads Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuth.setState({
      token: 'token',
      user: { email: 'admin@admin.com', name: 'Administrador' },
      isAuthenticated: true,
    });
  });

  it('should render the Sidebar with logout button', () => {
    renderWithLayout('/admin/dashboard');

    expect(screen.getByText('Sair')).toBeInTheDocument();
    expect(screen.getByText('admin@admin.com')).toBeInTheDocument();
  });

  it('should render the MobileHeader with logout popover', () => {
    renderWithLayout('/admin/dashboard');

    expect(screen.queryByText('Sair da Conta')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /a/i }));
    expect(screen.getByText('Sair da Conta')).toBeInTheDocument();
  });

  it('should render the BottomNavigation on mobile', () => {
    renderWithLayout('/admin/dashboard');

    // "Dashboard" e "Leads" aparecem na sidebar (desktop) e na bottom nav (mobile)
    const dashboardLink = screen.getAllByText('Dashboard').map((el) => el.closest('a'));
    const leadsLink = screen.getAllByText('Leads').map((el) => el.closest('a'));

    expect(dashboardLink.some((a) => a?.getAttribute('href') === '/admin/dashboard')).toBe(
      true
    );
    expect(leadsLink.some((a) => a?.getAttribute('href') === '/admin/leads')).toBe(true);
  });

  it('should render nested route content via Outlet', () => {
    renderWithLayout('/admin/leads');

    expect(screen.getByText('Leads Page')).toBeInTheDocument();
  });
});
