import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

interface RedirectIfLoggedInProps {
  children: ReactNode;
}

/**
 * Impede que um usuário já autenticado acesse a tela de login:
 * redireciona direto para o dashboard (US-04).
 */
export function RedirectIfLoggedIn({ children }: RedirectIfLoggedInProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
