import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from '../admin.service';

type MockPrisma = {
  lead: {
    count: ReturnType<typeof vi.fn>;
    aggregate: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe('AdminService', () => {
  let service: AdminService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = {
      lead: {
        count: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    service = new AdminService(prisma as never);
  });

  describe('getDashboard (RF-05)', () => {
    it('should return total leads and average score', async () => {
      prisma.lead.count.mockResolvedValue(10);
      prisma.lead.aggregate.mockResolvedValue({ _avg: { score: 62.5 } });
      prisma.lead.groupBy.mockResolvedValue([
        { diagnosticSlug: 'ON_RIGHT_TRACK', _count: { _all: 3 } },
        { diagnosticSlug: 'FINAL_STRETCH', _count: { _all: 2 } },
      ]);
      prisma.lead.findMany.mockResolvedValue([
        { createdAt: new Date('2026-08-01T10:00:00.000Z') },
        { createdAt: new Date('2026-08-01T11:00:00.000Z') },
        { createdAt: new Date('2026-08-02T10:00:00.000Z') },
      ]);

      const dashboard = await service.getDashboard();

      expect(dashboard.totalLeads).toBe(10);
      expect(dashboard.averageScore).toBe(62.5);
    });

    it('should count qualified leads with score > 55', async () => {
      prisma.lead.count
        .mockResolvedValueOnce(10) // total leads
        .mockResolvedValueOnce(4); // qualified leads
      prisma.lead.aggregate.mockResolvedValue({ _avg: { score: 62.5 } });
      prisma.lead.groupBy.mockResolvedValue([]);
      prisma.lead.findMany.mockResolvedValue([]);

      const dashboard = await service.getDashboard();

      expect(dashboard.qualifiedLeads).toBe(4);
      expect(prisma.lead.count).toHaveBeenCalledWith({
        where: { score: { gt: 55 } },
      });
    });

    it('should include all diagnostic ranges, zero-filling missing ones', async () => {
      prisma.lead.count.mockResolvedValue(0);
      prisma.lead.aggregate.mockResolvedValue({ _avg: { score: null } });
      prisma.lead.groupBy.mockResolvedValue([
        { diagnosticSlug: 'ON_RIGHT_TRACK', _count: { _all: 3 } },
      ]);
      prisma.lead.findMany.mockResolvedValue([]);

      const dashboard = await service.getDashboard();

      expect(dashboard.distributionByDiagnostic).toHaveLength(4);
      const bySlug = Object.fromEntries(
        dashboard.distributionByDiagnostic.map((d) => [d.slug, d.count]),
      );
      expect(bySlug).toEqual({
        STARTING_POINT: 0,
        IN_CONSTRUCTION: 0,
        ON_RIGHT_TRACK: 3,
        FINAL_STRETCH: 0,
      });
    });

    it('should return exactly 7 days with zero-filled empty days, ascending', async () => {
      prisma.lead.count.mockResolvedValue(0);
      prisma.lead.aggregate.mockResolvedValue({ _avg: { score: null } });
      prisma.lead.groupBy.mockResolvedValue([]);

      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);

      prisma.lead.findMany.mockResolvedValue([
        { createdAt: new Date(threeDaysAgo) },
        { createdAt: new Date(yesterday) },
        { createdAt: new Date(yesterday) },
      ]);

      const dashboard = await service.getDashboard();

      expect(dashboard.dailyLeads).toHaveLength(7);
      // Formato YYYY-MM-DD em todos os dias
      for (const day of dashboard.dailyLeads) {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      // Ordenação ascendente
      const dates = dashboard.dailyLeads.map((d) => d.date);
      expect([...dates].sort()).toEqual(dates);
      // Dias com leads têm contagem correta
      const byDate = Object.fromEntries(
        dashboard.dailyLeads.map((d) => [d.date, d.count]),
      );
      expect(byDate[fmt(threeDaysAgo)]).toBe(1);
      expect(byDate[fmt(yesterday)]).toBe(2);
      // Dias sem leads têm count = 0
      const emptyDays = dashboard.dailyLeads.filter((d) => d.count === 0);
      expect(emptyDays).toHaveLength(5);
      for (const day of emptyDays) {
        expect(day.count).toBe(0);
      }
    });
  });

  describe('getLeads (RF-05)', () => {
    const mockLeadRow = {
      id: 'lead-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      score: 62,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      diagnosticTitle: 'Na Trilha Certa',
      createdAt: new Date('2026-08-01T10:00:00.000Z'),
    };

    it('should return paginated leads with total, page and limit', async () => {
      prisma.lead.findMany.mockResolvedValue([mockLeadRow]);
      prisma.lead.count.mockResolvedValue(1);

      const result = await service.getLeads({ page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.leads[0]).toEqual({
        id: 'lead-1',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        score: 62,
        diagnosticSlug: 'ON_RIGHT_TRACK',
        diagnosticTitle: 'Na Trilha Certa',
        createdAt: '2026-08-01T10:00:00.000Z',
      });
    });

    it('should apply search and diagnostic filters', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      await service.getLeads({
        search: 'joao',
        diagnostic: 'ON_RIGHT_TRACK',
        page: 1,
        limit: 10,
      });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            diagnosticSlug: 'ON_RIGHT_TRACK',
          }),
        }),
      );
    });

    it('should default page to 1 and limit to 10', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      await service.getLeads({});

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });

  describe('getLeadDetails (RF-06)', () => {
    const mockLeadWithAnswers = {
      id: 'lead-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      createdAt: new Date('2026-08-01T10:00:00.000Z'),
      score: 62,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      diagnosticTitle: 'Na Trilha Certa',
      diagnosticMessage: 'Você está indo muito bem!',
      answers: [
        {
          questionText: 'Pergunta 1',
          alternativeText: 'Alternativa A',
          score: 2,
        },
        {
          questionText: 'Pergunta 2',
          alternativeText: 'Alternativa B',
          score: 4,
        },
      ],
    };

    it('should return contact info, result and answers summary', async () => {
      prisma.lead.findUnique.mockResolvedValue(mockLeadWithAnswers);

      const details = await service.getLeadDetails('lead-1');

      expect(details.contactInfo).toEqual({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        createdAt: '2026-08-01T10:00:00.000Z',
      });
      expect(details.result).toEqual({
        score: 62,
        diagnosticSlug: 'ON_RIGHT_TRACK',
        diagnosticTitle: 'Na Trilha Certa',
        diagnosticMessage: 'Você está indo muito bem!',
      });
      expect(details.answersSummary).toEqual([
        { questionText: 'Pergunta 1', selectedOptionText: 'Alternativa A', score: 2 },
        { questionText: 'Pergunta 2', selectedOptionText: 'Alternativa B', score: 4 },
      ]);
    });

    it('should throw 404 when lead does not exist', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);

      await expect(service.getLeadDetails('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
