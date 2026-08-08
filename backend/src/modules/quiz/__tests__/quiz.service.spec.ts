import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { QuizService } from '../quiz.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('QuizService', () => {
  let service: QuizService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: {
            question: {
              findMany: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getActiveQuiz', () => {
    it('should return quiz with 10 questions ordered by order field', async () => {
      const mockQuestions = Array.from({ length: 10 }, (_, index) => ({
        id: `q${index + 1}`,
        order: index + 1,
        text: `Pergunta ${index + 1}`,
        alternatives: [
          { id: `a${index + 1}-1`, text: 'Alternativa 1', score: 5 },
          { id: `a${index + 1}-2`, text: 'Alternativa 2', score: 10 },
        ],
      }));

      vi.spyOn(prisma.question, 'findMany').mockResolvedValue(mockQuestions as never);

      const result = await service.getActiveQuiz();

      expect(result.questions).toHaveLength(10);
      expect(result.questions[0].order).toBe(1);
    });

    it('should NOT include score field in alternatives', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          order: 1,
          text: 'Pergunta 1',
          alternatives: [
            { id: 'a1', text: 'Alternativa 1', score: 5 },
            { id: 'a2', text: 'Alternativa 2', score: 10 },
          ],
        },
      ];

      vi.spyOn(prisma.question, 'findMany').mockResolvedValue(mockQuestions as never);

      const result = await service.getActiveQuiz();

      result.questions.forEach((question) => {
        question.alternatives.forEach((alternative) => {
          expect(alternative).not.toHaveProperty('score');
        });
      });
    });

    it('should order questions by order field', async () => {
      const mockQuestions = [
        { id: 'q3', order: 3, text: 'Pergunta 3', alternatives: [] },
        { id: 'q1', order: 1, text: 'Pergunta 1', alternatives: [] },
        { id: 'q2', order: 2, text: 'Pergunta 2', alternatives: [] },
      ];

      vi.spyOn(prisma.question, 'findMany').mockResolvedValue(mockQuestions as never);

      const result = await service.getActiveQuiz();

      expect(result.questions[0].order).toBe(1);
      expect(result.questions[1].order).toBe(2);
      expect(result.questions[2].order).toBe(3);
    });
  });
});
