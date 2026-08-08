import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DIAGNOSTICS } from '../scoring/diagnostic.enum';

export interface DiagnosticDistribution {
  slug: string;
  title: string;
  count: number;
}

export interface DailyLeads {
  date: string;
  count: number;
}

export interface AdminDashboardResponse {
  totalLeads: number;
  averageScore: number;
  distributionByDiagnostic: DiagnosticDistribution[];
  dailyLeads: DailyLeads[];
}

/**
 * Métricas administrativas (RF-05): KPIs do dashboard.
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<AdminDashboardResponse> {
    const [totalLeads, average, grouped, createdAtRows] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.aggregate({ _avg: { score: true } }),
      this.prisma.lead.groupBy({
        by: ['diagnosticSlug'],
        _count: { _all: true },
      }),
      this.prisma.lead.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      totalLeads,
      averageScore: average._avg.score ?? 0,
      distributionByDiagnostic: this.buildDistribution(grouped),
      dailyLeads: this.buildDailyLeads(createdAtRows),
    };
  }

  /** Distribuição completa por faixa de diagnóstico (inclui faixas sem leads). */
  private buildDistribution(
    grouped: { diagnosticSlug: string; _count: { _all: number } }[],
  ): DiagnosticDistribution[] {
    const counts = new Map(
      grouped.map((g) => [g.diagnosticSlug, g._count._all]),
    );

    return DIAGNOSTICS.map((d) => ({
      slug: d.slug,
      title: d.title,
      count: counts.get(d.slug) ?? 0,
    }));
  }

  /** Agrega leads por dia (YYYY-MM-DD), ordenado cronologicamente. */
  private buildDailyLeads(
    rows: { createdAt: Date }[],
  ): DailyLeads[] {
    const counts = new Map<string, number>();

    for (const { createdAt } of rows) {
      const date = createdAt.toISOString().slice(0, 10);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }
}
