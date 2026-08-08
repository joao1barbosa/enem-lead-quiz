import { motion } from 'framer-motion';
import type { LeadResult } from '../../types/quiz';

interface ResultPageProps {
  result: LeadResult;
}

/**
 * Página de resultado (US-03): pontuação, faixa de diagnóstico,
 * mensagem personalizada e resumo das respostas, com animação de entrada
 * (Framer Motion, requirements.md §7.4).
 */
export function ResultPage({ result }: ResultPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl space-y-8 p-6"
    >
      <div className="space-y-4 text-center">
        <div className="text-6xl font-bold text-primary">{result.score}</div>
        <h2 className="text-3xl font-semibold">{result.diagnosticTitle}</h2>
        <p className="text-lg text-muted-foreground">{result.diagnosticMessage}</p>
      </div>

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
    </motion.div>
  );
}
