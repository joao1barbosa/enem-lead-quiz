export enum DiagnosticSlug {
  STARTING_POINT = 'STARTING_POINT',
  IN_CONSTRUCTION = 'IN_CONSTRUCTION',
  ON_RIGHT_TRACK = 'ON_RIGHT_TRACK',
  FINAL_STRETCH = 'FINAL_STRETCH',
}

export interface DiagnosticConfig {
  slug: DiagnosticSlug;
  title: string;
  message: string;
  minScore: number;
  maxScore: number;
}

/**
 * Faixas de diagnóstico (RF-02). As faixas são contíguas e cobrem 0-100.
 */
export const DIAGNOSTICS: DiagnosticConfig[] = [
  {
    slug: DiagnosticSlug.STARTING_POINT,
    title: 'Ponto de Partida',
    message:
      'Você está começando sua jornada de preparação. Não desanime! Com dedicação e os recursos certos, você pode evoluir rapidamente.',
    minScore: 0,
    maxScore: 25,
  },
  {
    slug: DiagnosticSlug.IN_CONSTRUCTION,
    title: 'Em Construção',
    message:
      'Você está construindo suas bases. Continue estudando e focando nos pontos fracos para avançar.',
    minScore: 26,
    maxScore: 50,
  },
  {
    slug: DiagnosticSlug.ON_RIGHT_TRACK,
    title: 'Na Trilha Certa',
    message:
      'Você está indo muito bem! Mantenha o ritmo e refine suas habilidades para alcançar a excelência.',
    minScore: 51,
    maxScore: 75,
  },
  {
    slug: DiagnosticSlug.FINAL_STRETCH,
    title: 'Reta Final',
    message:
      'Excelente! Você está quase lá. Continue com foco e confiança para garantir um ótimo resultado.',
    minScore: 76,
    maxScore: 100,
  },
];
