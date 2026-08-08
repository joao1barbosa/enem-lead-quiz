import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// AppModule requires these env vars for ConfigModule validation.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://quiz_user:quiz_password@localhost:5432/quiz_db';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3100';
process.env.THROTTLE_TTL = '60';
process.env.THROTTLE_LIMIT = '1000';

describe('GET /api/quizzes/active (e2e)', () => {
  let app: INestApplication;

  const mockQuestions = Array.from({ length: 10 }, (_, index) => ({
    id: `q${index + 1}`,
    order: index + 1,
    text: `Pergunta ${index + 1}`,
    alternatives: [
      { id: `a${index + 1}-1`, text: 'Alternativa 1', score: 10 },
      { id: `a${index + 1}-2`, text: 'Alternativa 2', score: 5 },
      { id: `a${index + 1}-3`, text: 'Alternativa 3', score: 0 },
    ],
  }));

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        question: {
          findMany: vi.fn().mockResolvedValue(mockQuestions),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with 10 questions ordered by order', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/quizzes/active')
      .expect(200);

    expect(response.body.quiz).toBeDefined();
    expect(response.body.quiz.id).toBeDefined();
    expect(response.body.quiz.questions).toHaveLength(10);
    expect(response.body.quiz.questions.map((q) => q.order)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it('should return alternatives without score field', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/quizzes/active')
      .expect(200);

    response.body.quiz.questions.forEach((question) => {
      expect(question.id).toBeDefined();
      expect(question.text).toBeDefined();
      expect(question.alternatives).toBeInstanceOf(Array);

      question.alternatives.forEach((alternative) => {
        expect(alternative.id).toBeDefined();
        expect(alternative.text).toBeDefined();
        expect(alternative).not.toHaveProperty('score');
      });
    });
  });
});
