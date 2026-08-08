import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { LeadService } from '../lead.service';

type MockPrisma = {
  lead: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  question: { findMany: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

describe('LeadService', () => {
  let service: LeadService;
  let prisma: MockPrisma;

  const dto = {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    answers: [
      { questionId: 'q1', alternativeId: 'a1' },
      { questionId: 'q2', alternativeId: 'b1' },
    ],
  };

  beforeEach(() => {
    prisma = {
      lead: { findUnique: vi.fn(), create: vi.fn() },
      question: { findMany: vi.fn() },
      $transaction: vi.fn(),
    };
    service = new LeadService(prisma as never);
  });

  it('should reject duplicate email with 409', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });

  it('should create lead and return minimized payload', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    prisma.question.findMany.mockResolvedValue([
      {
        id: 'q1',
        text: 'Pergunta 1',
        alternatives: [{ id: 'a1', text: 'Alt A', score: 7 }],
      },
      {
        id: 'q2',
        text: 'Pergunta 2',
        alternatives: [{ id: 'b1', text: 'Alt B', score: 5 }],
      },
    ]);
    prisma.$transaction.mockImplementation(async (fn: unknown) =>
      (fn as (tx: MockPrisma) => Promise<void>)(prisma),
    );

    const result = await service.create(dto);

    expect(result.score).toBe(12);
    expect(result.diagnosticSlug).toBe('STARTING_POINT');
    expect(result.answersSummary).toEqual([
      { questionText: 'Pergunta 1', selectedOptionText: 'Alt A' },
      { questionText: 'Pergunta 2', selectedOptionText: 'Alt B' },
    ]);
    expect(prisma.lead.create).toHaveBeenCalled();

    // Privacy by Design (RF-03): payload não expõe PII nem IDs.
    expect(result).not.toHaveProperty('name');
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('phone');
    expect(result).not.toHaveProperty('id');
  });

  it('should silently discard bot submissions (honeypot)', async () => {
    const result = await service.create({ ...dto, honeypot: 'filled' });

    expect(prisma.lead.findUnique).not.toHaveBeenCalled();
    expect(prisma.lead.create).not.toHaveBeenCalled();
    expect(result.score).toBe(0);
    expect(result.answersSummary).toEqual([]);
  });

  it('should reject invalid alternative with 400', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    prisma.question.findMany.mockResolvedValue([
      { id: 'q1', text: 'Pergunta 1', alternatives: [] },
    ]);

    await expect(service.create(dto)).rejects.toThrow(/Alternativa inválida/);
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });
});
