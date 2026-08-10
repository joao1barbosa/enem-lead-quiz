import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LeadResult } from '../../types/quiz';
import { ScoreCircle } from '@/components/ui/score-circle';
import { Button } from '@/components/ui/button';

interface ResultPageProps {
  result: LeadResult;
}

/**
 * Página de resultado (US-03): pontuação, faixa de diagnóstico e mensagem
 * personalizada centralizados. Resumo das respostas opcional via toggle.
 */
export function ResultPage({ result }: ResultPageProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center p-6"
    >
      <div className="flex flex-col items-center space-y-6">
        <ScoreCircle score={result.score} />

        <h2 data-testid="diagnostic-title" className="text-3xl font-semibold">
          {result.diagnosticTitle}
        </h2>

        <p className="max-w-md text-center text-lg text-muted-foreground">
          {result.diagnosticMessage}
        </p>

        <Button
          variant="outline"
          onClick={() => setShowAnswers(!showAnswers)}
          className="mt-4"
        >
          {showAnswers ? 'Ocultar respostas' : 'Ver respostas'}
        </Button>

        {showAnswers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full max-w-2xl space-y-3"
          >
            <h3 className="text-xl font-semibold">Resumo das Respostas</h3>
            {result.answersSummary.map((answer, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <p className="font-medium">{answer.questionText}</p>
                <p className="text-sm text-muted-foreground">
                  Sua resposta:{' '}
                  <span className="font-medium">{answer.selectedOptionText}</span>
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
