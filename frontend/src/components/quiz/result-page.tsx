import { motion } from 'framer-motion';
import type { LeadResult } from '../../types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultPageProps {
  result: LeadResult;
}

const DIAGNOSTIC_COLOR_MAP: Record<string, string> = {
  STARTING_POINT: 'text-diagnostic-starting',
  IN_CONSTRUCTION: 'text-diagnostic-construction',
  ON_RIGHT_TRACK: 'text-diagnostic-track',
  FINAL_STRETCH: 'text-diagnostic-stretch',
};

function getScoreColor(slug: string): string {
  return DIAGNOSTIC_COLOR_MAP[slug] ?? 'text-primary';
}

/**
 * Página de resultado (US-03): pontuação, faixa de diagnóstico,
 * mensagem personalizada e resumo das respostas, com animação de entrada
 * (Framer Motion, requirements.md §7.4).
 */
export function ResultPage({ result }: ResultPageProps) {
  const scoreColor = getScoreColor(result.diagnosticSlug);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl space-y-8 p-6"
    >
      <Card>
        <CardHeader className="space-y-4 text-center">
          <div data-testid="score" className={`text-6xl font-bold ${scoreColor}`}>{result.score}</div>
          <CardTitle data-testid="diagnostic-title" className="text-3xl font-semibold">
            {result.diagnosticTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-lg text-muted-foreground">{result.diagnosticMessage}</p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Resumo das Respostas</h3>
            <div className="space-y-3">
              {result.answersSummary.map((answer, index) => (
                <div key={index} className="rounded-lg border border-border p-4">
                  <p className="font-medium">{answer.questionText}</p>
                  <p className="text-sm text-muted-foreground">
                    Sua resposta: <span className="font-medium">{answer.selectedOptionText}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
