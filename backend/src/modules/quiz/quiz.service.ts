import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizResponseDto } from './dto/quiz-response.dto';

export const ACTIVE_QUIZ_ID = 'active-quiz';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveQuiz(): Promise<QuizResponseDto> {
    const questions = await this.prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 10,
      include: {
        alternatives: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    return {
      id: ACTIVE_QUIZ_ID,
      questions: questions
        .map((question) => ({
          id: question.id,
          order: question.order,
          text: question.text,
          alternatives: question.alternatives.map(({ id, text }) => ({
            id,
            text,
          })),
        }))
        .sort((a, b) => a.order - b.order),
    };
  }
}
