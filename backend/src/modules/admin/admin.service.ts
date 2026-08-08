import { Injectable, NotFoundException } from '@nestjs/common';
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

export interface AdminLeadSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  diagnosticSlug: string;
  diagnosticTitle: string;
  createdAt: string;
}

export interface AdminLeadsListResponse {
  leads: AdminLeadSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminLeadDetailsResponse {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  result: {
    score: number;
    diagnosticSlug: string;
    diagnosticTitle: string;
    diagnosticMessage: string;
  };
  answersSummary: Array<{
    questionText: string;
    selectedOptionText: string;
    score: number;
  }>;
}

export interface AdminLeadsFilter {
  search?: string;
  diagnostic?: string;
  page?: number;
  limit?: number;
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

  /** Lista paginada de leads com filtros opcionais (RF-05). */
  async getLeads(filter: AdminLeadsFilter): Promise<AdminLeadsListResponse> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const where = this.buildWhere(filter);

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      leads: leads.map((lead) => this.toLeadSummary(lead)),
      total,
      page,
      limit,
    };
  }

  /** Detalhes completos de um lead (RF-06). */
  async getLeadDetails(id: string): Promise<AdminLeadDetailsResponse> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { answers: true },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado.');
    }

    return {
      contactInfo: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        createdAt: lead.createdAt.toISOString(),
      },
      result: {
        score: lead.score,
        diagnosticSlug: lead.diagnosticSlug,
        diagnosticTitle: lead.diagnosticTitle,
        diagnosticMessage: lead.diagnosticMessage,
      },
      answersSummary: lead.answers.map((answer) => ({
        questionText: answer.questionText,
        selectedOptionText: answer.alternativeText,
        score: answer.score,
      })),
    };
  }

  private buildWhere(filter: AdminLeadsFilter): {
    diagnosticSlug?: string;
    OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { email: { contains: string; mode: 'insensitive' } }>;
  } {
    const where: {
      diagnosticSlug?: string;
      OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { email: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (filter.diagnostic) {
      where.diagnosticSlug = filter.diagnostic;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private toLeadSummary(lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    score: number;
    diagnosticSlug: string;
    diagnosticTitle: string;
    createdAt: Date;
  }): AdminLeadSummary {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      score: lead.score,
      diagnosticSlug: lead.diagnosticSlug,
      diagnosticTitle: lead.diagnosticTitle,
      createdAt: lead.createdAt.toISOString(),
    };
  }
}
