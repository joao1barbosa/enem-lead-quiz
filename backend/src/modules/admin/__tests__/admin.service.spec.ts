import { describe, it, expect, beforeEach, vi } from 'vitest';
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

    it('should group daily leads by date ascending', async () => {
      prisma.lead.count.mockResolvedValue(0);
      prisma.lead.aggregate.mockResolvedValue({ _avg: { score: null } });
      prisma.lead.groupBy.mockResolvedValue([]);
      prisma.lead.findMany.mockResolvedValue([
        { createdAt: new Date('2026-08-02T10:00:00.000Z') },
        { createdAt: new Date('2026-08-01T10:00:00.000Z') },
        { createdAt: new Date('2026-08-01T11:00:00.000Z') },
      ]);

      const dashboard = await service.getDashboard();

      expect(dashboard.dailyLeads).toEqual([
        { date: '2026-08-01', count: 2 },
        { date: '2026-08-02', count: 1 },
      ]);
    });
  });
});
