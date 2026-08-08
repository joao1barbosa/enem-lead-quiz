import { DIAGNOSTICS, DiagnosticConfig } from './diagnostic.enum';

export interface ScoredAnswer {
  score: number;
}

/**
 * Cálculo de pontuação e mapeamento da faixa de diagnóstico (RF-02).
 */
export class ScoringCalculator {
  calculate(answers: ScoredAnswer[]): number {
    return answers.reduce((total, answer) => total + answer.score, 0);
  }

  getDiagnostic(score: number): DiagnosticConfig {
    return (
      DIAGNOSTICS.find(
        (diagnostic) => score >= diagnostic.minScore && score <= diagnostic.maxScore,
      ) ?? DIAGNOSTICS[0]
    );
  }
}
