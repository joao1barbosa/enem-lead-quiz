import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileHeader } from '../mobile-header';
import { useAuth } from '../../../hooks/use-auth';

describe('MobileHeader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuth.setState({
      token: 'token',
      user: { email: 'admin@admin.com', name: 'Administrador' },
      isAuthenticated: true,
    });
  });

  it('should render the logo title', () => {
    render(
      <MemoryRouter>
        <MobileHeader />
      </MemoryRouter>
    );

    expect(screen.getByText('ENEM Lead Quiz')).toBeInTheDocument();
  });

  it('should open the popover with user email and logout option when avatar is clicked', () => {
    render(
      <MemoryRouter>
        <MobileHeader />
      </MemoryRouter>
    );

    expect(screen.queryByText('Sair da Conta')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /a/i }));

    expect(screen.getByText('admin@admin.com')).toBeInTheDocument();
    expect(screen.getByText('Sair da Conta')).toBeInTheDocument();
  });

  it('should call logout and close the popover when clicking Sair da Conta', () => {
    const logoutSpy = vi.spyOn(useAuth.getState(), 'logout');

    render(
      <MemoryRouter>
        <MobileHeader />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /a/i }));
    fireEvent.click(screen.getByText('Sair da Conta'));

    expect(logoutSpy).toHaveBeenCalled();
    expect(screen.queryByText('Sair da Conta')).not.toBeInTheDocument();
  });
});
