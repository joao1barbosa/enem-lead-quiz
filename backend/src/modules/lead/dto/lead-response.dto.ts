export class AnswerSummaryDto {
  questionText: string;
  selectedOptionText: string;
}

/**
 * Payload público de resultado (RF-03): dados mínimos necessários para a
 * tela de resultado. Não expõe PII (name, email, phone) nem IDs.
 */
export class LeadResponseDto {
  score: number;
  diagnosticSlug: string;
  diagnosticTitle: string;
  diagnosticMessage: string;
  answersSummary: AnswerSummaryDto[];
}
