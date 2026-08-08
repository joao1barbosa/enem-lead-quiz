import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminDashboard } from '../admin-dashboard';
import * as api from '../../../lib/api';

const DASHBOARD = {
  totalLeads: 42,
  averageScore: 71.5,
  distributionByDiagnostic: [
    { slug: 'STARTING_POINT', title: 'Ponto de Partida', count: 5 },
    { slug: 'IN_CONSTRUCTION', title: 'Em Construção', count: 12 },
    { slug: 'ON_RIGHT_TRACK', title: 'Na Trilha Certa', count: 18 },
    { slug: 'FINAL_STRETCH', title: 'Reta Final', count: 7 },
  ],
  dailyLeads: [
    { date: '2026-08-01', count: 3 },
    { date: '2026-08-02', count: 5 },
  ],
};

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <AdminDashboard />
    </QueryClientProvider>
  );

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state while fetching', () => {
    vi.spyOn(api.api, 'get').mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument();
  });

  it('should render KPIs and charts with dashboard data', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DASHBOARD });

    renderPage();

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();

    // KPIs
    expect(screen.getByText('Total de Leads')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Pontuação Média')).toBeInTheDocument();
    expect(screen.getByText('71.5')).toBeInTheDocument();
    expect(screen.getByText('Faixas Diagnósticas')).toBeInTheDocument();
    const faixasCard = screen.getByText('Faixas Diagnósticas').closest('div')!.parentElement!;
    expect(within(faixasCard).getByText('4')).toBeInTheDocument();

    // Gráficos
    expect(screen.getByText('Distribuição por Faixa')).toBeInTheDocument();
    expect(screen.getByText('Leads por Dia (Últimos 30 dias)')).toBeInTheDocument();

    expect(api.api.get).toHaveBeenCalledWith('/api/admin/dashboard');
  });

  it('should show error message when API fails', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));

    renderPage();

    expect(
      await screen.findByText('Erro ao carregar dashboard')
    ).toBeInTheDocument();
  });
});
