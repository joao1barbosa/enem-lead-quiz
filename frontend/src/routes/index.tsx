import { QuizFlow } from '../components/quiz/quiz-flow';
import { AdminLogin } from './admin/admin-login';
import { AdminLayout } from './admin/admin-layout';
import { AdminDashboard } from './admin/admin-dashboard';
import { AdminLeads } from './admin/admin-leads';
import { ProtectedRoute } from './admin/protected-route';

/**
 * Configuração central de rotas da SPA (seção 1.1 do requirements).
 * A área administrativa vive sob /admin com layout persistente
 * (AdminLayout) e proteção de autenticação (ProtectedRoute).
 */
export const routes = [
  { path: '/', element: <QuizFlow /> },
  { path: '*', element: <QuizFlow /> },
  { path: '/admin/login', element: <AdminLogin /> },
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
    ],
  },
];
