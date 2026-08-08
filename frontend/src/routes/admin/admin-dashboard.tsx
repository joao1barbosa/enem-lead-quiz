import { Users, TrendingUp, Target } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';
import { KpiCard } from '../../components/admin/kpi-card';
import { DiagnosticDonut } from '../../components/admin/diagnostic-donut';
import { LeadsAreaChart } from '../../components/admin/leads-area-chart';

/**
 * Página de Dashboard Executivo do painel administrativo (RF-05, US-05).
 * Exibe KPIs (total de leads, pontuação média, leads qualificados) e os
 * gráficos de distribuição por faixa (donut) e evolução diária de leads (área).
 */
export function AdminDashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-center text-red-600">Erro ao carregar dashboard</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total de Leads"
          value={data.totalLeads}
          icon={Users}
          description="Leads capturados"
        />
        <KpiCard
          title="Pontuação Média"
          value={data.averageScore.toFixed(1)}
          icon={TrendingUp}
          description="Score médio dos leads"
        />
        <KpiCard
          title="Leads Qualificados"
          value={data.qualifiedLeads}
          icon={Target}
          description="Leads com pontuação > 55"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiagnosticDonut data={data.distributionByDiagnostic} />
        <LeadsAreaChart data={data.dailyLeads} />
      </div>
    </div>
  );
}
