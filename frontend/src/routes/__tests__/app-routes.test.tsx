import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '../../App';
import { useAuth } from '../../hooks/use-auth';
import { useQuizStore } from '../../stores/quiz-store';
import * as api from '../../lib/api';
import type { Quiz } from '../../types/quiz';

const DASHBOARD = {
  totalLeads: 42,
  qualifiedLeads: 28,
  averageScore: 71.5,
  distributionByDiagnostic: [
    { slug: 'STARTING_POINT', title: 'Ponto de Partida', count: 5 },
  ],
  dailyLeads: [{ date: '2026-08-01', count: 3 }],
};

const mockQuizResponse: { quiz: Quiz } = {
  quiz: {
    id: 'active-quiz',
    questions: [
      {
        id: 'q1',
        order: 1,
        text: 'Qual é a capital do Brasil?',
        alternatives: [
          { id: 'q1a1', text: 'São Paulo' },
          { id: 'q1a2', text: 'Brasília' },
        ],
      },
    ],
  },
};

const renderAt = (initialEntry: string) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  );

const setAuthenticated = () =>
  useAuth.setState({
    token: 'token',
    user: { email: 'admin@admin.com' },
    isAuthenticated: true,
  });

describe('AppRoutes (redirecionamentos)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useQuizStore.getState().reset();
    useAuth.setState({ token: null, user: null, isAuthenticated: false });
  });

  it('redireciona /admin/* sem autenticação para /admin/login', () => {
    renderAt('/admin/dashboard');

    expect(screen.getByText('Admin - ENEM Lead Quiz')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('mantém /admin/login acessível para usuário não autenticado', () => {
    renderAt('/admin/login');

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('redireciona /admin/login para /admin/dashboard quando já autenticado', async () => {
    setAuthenticated();
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DASHBOARD });

    renderAt('/admin/login');

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
  });

  it('redireciona rota /admin inexistente para /admin/dashboard', async () => {
    setAuthenticated();
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DASHBOARD });

    renderAt('/admin/rota-que-nao-existe');

    expect(await screen.findByText('42')).toBeInTheDocument();
  });

  it('redireciona rota inexistente para / (quiz)', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: mockQuizResponse });

    renderAt('/rota-que-nao-existe');

    // A rota raiz abre na tela de introdução; o quiz começa após "Começar Quiz".
    fireEvent.click(await screen.findByRole('button', { name: /começar quiz/i }));

    expect(
      await screen.findByText('Qual é a capital do Brasil?')
    ).toBeInTheDocument();
  });
});
