import { Navigate } from 'react-router-dom';
import { QuizFlow } from '../components/quiz/quiz-flow';
import { AdminLogin } from './admin/admin-login';
import { AdminLayout } from './admin/admin-layout';
import { AdminDashboard } from './admin/admin-dashboard';
import { AdminLeads } from './admin/admin-leads';
import { ProtectedRoute } from './admin/protected-route';
import { RedirectIfLoggedIn } from './admin/redirect-if-logged-in';

/**
 * Configuração central de rotas da SPA (seção 1.1 do requirements).
 * A área administrativa vive sob /admin com layout persistente
 * (AdminLayout) e proteção de autenticação (ProtectedRoute).
 *
 * Redirecionamentos:
 * - Rota inexistente → / (quiz)
 * - /admin/login com sessão ativa → /admin/dashboard
 * - Rota /admin inexistente → /admin/dashboard
 */
export const routes = [
  { path: '/', element: <QuizFlow /> },
  { path: '*', element: <Navigate to="/" replace /> },
  {
    path: '/admin/login',
    element: (
      <RedirectIfLoggedIn>
        <AdminLogin />
      </RedirectIfLoggedIn>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'leads', element: <AdminLeads /> },
      { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
    ],
  },
];
