import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { QuizController } from '../quiz.controller';
import { QuizService } from '../quiz.service';

describe('QuizController', () => {
  let controller: QuizController;
  let service: QuizService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: {
            getActiveQuiz: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
    service = module.get<QuizService>(QuizService);
  });

  describe('getActiveQuiz', () => {
    it('should return active quiz', async () => {
      const mockQuiz = {
        id: 'active-quiz',
        questions: [
          {
            id: 'q1',
            order: 1,
            text: 'Pergunta 1',
            alternatives: [{ id: 'a1', text: 'Alternativa 1' }],
          },
        ],
      };

      vi.spyOn(service, 'getActiveQuiz').mockResolvedValue(mockQuiz as never);

      const result = await controller.getActiveQuiz();

      expect(result).toEqual({ quiz: mockQuiz });
      expect(service.getActiveQuiz).toHaveBeenCalled();
    });
  });
});
