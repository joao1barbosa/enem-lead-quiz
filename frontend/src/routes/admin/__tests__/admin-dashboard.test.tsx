import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminDashboard } from '../admin-dashboard';
import * as api from '../../../lib/api';

const DASHBOARD = {
  totalLeads: 42,
  qualifiedLeads: 28,
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

  it('should show skeletons while fetching', () => {
    vi.spyOn(api.api, 'get').mockReturnValue(new Promise(() => {}));

    const { container } = renderPage();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render KPIs and charts with dashboard data', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DASHBOARD });

    renderPage();

    // Aguarda um valor que só existe no estado com dados (o h1 "Dashboard"
    // também aparece no skeleton de loading).
    expect(await screen.findByText('42')).toBeInTheDocument();

    // KPIs
    expect(screen.getByText('Total de Leads')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Pontuação Média')).toBeInTheDocument();
    expect(screen.getByText('71.5')).toBeInTheDocument();
    expect(screen.getByText('Leads Qualificados')).toBeInTheDocument();
    // CardTitle (shadcn) é um <div>: sobe um nível extra até o Card raiz
    const qualifiedCard = screen.getByText('Leads Qualificados').closest('div')!.parentElement!.parentElement!;
    expect(within(qualifiedCard).getByText('28')).toBeInTheDocument();
    expect(within(qualifiedCard).getByText('Leads com pontuação > 55')).toBeInTheDocument();

    // Gráficos
    expect(screen.getByText('Distribuição por Faixa')).toBeInTheDocument();
    expect(screen.getByText('Leads por Dia')).toBeInTheDocument();

    expect(api.api.get).toHaveBeenCalledWith('/api/admin/dashboard');
  });

  it('should show error message when API fails', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));

    renderPage();

    expect(
      await screen.findByText('Erro ao carregar dashboard')
    ).toBeInTheDocument();
  });

  it('should retry the request when clicking Tentar novamente', async () => {
    vi.spyOn(api.api, 'get')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: DASHBOARD });

    renderPage();

    await screen.findByText('Erro ao carregar dashboard');
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(await screen.findByText('42')).toBeInTheDocument();
  });

  it('should show empty state in charts when there is no data', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: { ...DASHBOARD, distributionByDiagnostic: [], dailyLeads: [] },
    });

    renderPage();

    // Aguarda os dados carregarem (o h1 "Dashboard" também aparece no skeleton).
    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getAllByText('Sem dados no período')).toHaveLength(2);
  });
});
