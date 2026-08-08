import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringCalculator } from '../scoring/scoring.calculator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadResponseDto } from './dto/lead-response.dto';

interface ResolvedAnswer {
  questionId: string;
  questionText: string;
  alternativeId: string;
  alternativeText: string;
  score: number;
}

/**
 * Submissão de leads (RF-03, RF-04, RNF-01):
 * - Bloqueia e-mail duplicado com HTTP 409 (RF-04)
 * - Calcula score + faixa de diagnóstico (RF-02)
 * - Retorna payload minimizado sem PII (RF-03)
 * - Descarta silenciosamente bots via honeypot (RNF-01)
 */
@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);
  private readonly scoring = new ScoringCalculator();

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto): Promise<LeadResponseDto> {
    // RNF-01: honeypot preenchido = bot -> descarta sem persistir.
    if (dto.honeypot) {
      this.logger.warn('Bot detectado via honeypot; lead descartado.');
      return this.silentResponse();
    }

    // RF-04: bloqueio de e-mail duplicado.
    const existing = await this.prisma.lead.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Este e-mail já realizou o quiz.');
    }

    const resolvedAnswers = await this.resolveAnswers(dto);
    const score = this.scoring.calculate(
      resolvedAnswers.map((answer) => ({ score: answer.score })),
    );
    const diagnostic = this.scoring.getDiagnostic(score);

    await this.prisma.$transaction(async (tx) => {
      await tx.lead.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          score,
          diagnosticSlug: diagnostic.slug,
          diagnosticTitle: diagnostic.title,
          diagnosticMessage: diagnostic.message,
          answers: {
            create: resolvedAnswers.map((answer) => ({
              questionId: answer.questionId,
              questionText: answer.questionText,
              alternativeId: answer.alternativeId,
              alternativeText: answer.alternativeText,
              score: answer.score,
            })),
          },
        },
      });
    });

    return {
      score,
      diagnosticSlug: diagnostic.slug,
      diagnosticTitle: diagnostic.title,
      diagnosticMessage: diagnostic.message,
      answersSummary: resolvedAnswers.map((answer) => ({
        questionText: answer.questionText,
        selectedOptionText: answer.alternativeText,
      })),
    };
  }

  /**
   * Resolve textos e pontuações das alternativas escolhidas (o payload
   * público do quiz não expõe scores; eles são lidos apenas aqui).
   */
  private async resolveAnswers(dto: CreateLeadDto): Promise<ResolvedAnswer[]> {
    const questionIds = [...new Set(dto.answers.map((a) => a.questionId))];
    const alternativeIds = [...new Set(dto.answers.map((a) => a.alternativeId))];

    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        text: true,
        alternatives: {
          where: { id: { in: alternativeIds } },
          select: { id: true, text: true, score: true },
        },
      },
    });

    const questionMap = new Map(
      questions.map((question) => [
        question.id,
        {
          text: question.text,
          alternatives: new Map(
            question.alternatives.map((alternative) => [alternative.id, alternative]),
          ),
        },
      ]),
    );

    return dto.answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      const alternative = question?.alternatives.get(answer.alternativeId);
      if (!question || !alternative) {
        throw new BadRequestException(
          'Alternativa inválida para a pergunta informada.',
        );
      }
      return {
        questionId: answer.questionId,
        questionText: question.text,
        alternativeId: answer.alternativeId,
        alternativeText: alternative.text,
        score: alternative.score,
      };
    });
  }

  /** Resposta neutra para bots (sem persistência de dados). */
  private silentResponse(): LeadResponseDto {
    const diagnostic = this.scoring.getDiagnostic(0);
    return {
      score: 0,
      diagnosticSlug: diagnostic.slug,
      diagnosticTitle: diagnostic.title,
      diagnosticMessage: diagnostic.message,
      answersSummary: [],
    };
  }
}
