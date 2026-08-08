import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AlternativeResponseDto,
  QuestionResponseDto,
  QuizResponseDto,
} from './dto/quiz-response.dto';

export const ACTIVE_QUIZ_ID = 'active-quiz';
export const MAX_QUESTIONS = 10;

/**
 * Public-facing payload shape for a single alternative.
 */
interface AlternativeRecord {
  id: string;
  text: string;
}

/**
 * Question row as selected from the database (score intentionally excluded).
 */
interface QuestionRecord {
  id: string;
  order: number;
  text: string;
  alternatives: AlternativeRecord[];
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the active quiz (public payload).
   *
   * Only active questions are considered. Questions are returned sorted by
   * `order` (up to MAX_QUESTIONS) and alternatives never expose their `score`
   * field, keeping the scoring logic private by design.
   */
  async getActiveQuiz(): Promise<QuizResponseDto> {
    const questions = await this.prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: MAX_QUESTIONS,
      select: {
        id: true,
        order: true,
        text: true,
        alternatives: {
          select: { id: true, text: true },
        },
      },
    });

    if (questions.length < MAX_QUESTIONS) {
      this.logger.warn(
        `Active quiz contains only ${questions.length}/${MAX_QUESTIONS} questions.`,
      );
    }

    return {
      id: ACTIVE_QUIZ_ID,
      questions: this.toOrderedResponse(questions as QuestionRecord[]),
    };
  }

  /**
   * Maps raw question rows into the public DTO shape, defensively stripping
   * any extra fields (e.g. `score`) that may be present in the source data.
   */
  private toResponse(questions: QuestionRecord[]): QuestionResponseDto[] {
    return questions.map((question) => ({
      id: question.id,
      order: question.order,
      text: question.text,
      alternatives: question.alternatives.map(
        ({ id, text }): AlternativeResponseDto => ({ id, text }),
      ),
    }));
  }

  /**
   * Orders questions by `order` ascending and enforces the 10-question limit
   * as a defensive guarantee on top of the database-level constraints.
   */
  private toOrderedResponse(questions: QuestionRecord[]): QuestionResponseDto[] {
    return [...this.toResponse(questions)]
      .sort((a, b) => a.order - b.order)
      .slice(0, MAX_QUESTIONS);
  }
}
