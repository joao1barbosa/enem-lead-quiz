import { Users, TrendingUp, Target } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';
import { KpiCard } from '../../components/admin/kpi-card';
import { DiagnosticDonut } from '../../components/admin/diagnostic-donut';
import { LeadsAreaChart } from '../../components/admin/leads-area-chart';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página de Dashboard Executivo do painel administrativo (RF-05, US-05).
 * Exibe KPIs (total de leads, pontuação média, leads qualificados) e os
 * gráficos de distribuição por faixa (donut) e evolução diária de leads (área).
 */
export function AdminDashboard() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Skeleton dos KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard title="Total de Leads" value="" icon={Users} loading />
          <KpiCard title="Pontuação Média" value="" icon={TrendingUp} loading />
          <KpiCard title="Leads Qualificados" value="" icon={Target} loading />
        </div>

        {/* Skeleton dos gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Distribuição por Faixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Leads por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="rounded-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-destructive">Erro ao carregar dashboard</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
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
