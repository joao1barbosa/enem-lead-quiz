import { motion } from 'framer-motion';
import { BarChart3, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntroPageProps {
  totalQuestions: number;
  onStart: () => void;
}

const benefits = [
  { icon: Clock, label: 'Leva menos de 3 minutos' },
  { icon: BarChart3, label: 'Resultado imediato' },
  { icon: Target, label: 'Dicas personalizadas' },
];

/**
 * Tela de introdução exibida antes do quiz (US-01): apresenta o quiz de forma
 * curta e oferece o botão que inicia a primeira pergunta.
 */
export function IntroPage({ totalQuestions, onStart }: IntroPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12"
    >
      <div className="flex w-full max-w-lg flex-col items-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Descubra seu nível de preparo para o ENEM
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Responda {totalQuestions} perguntas rápidas e receba um diagnóstico
            personalizado do seu desempenho.
          </p>
        </div>

        <ul className="w-full space-y-3">
          {benefits.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-3 text-muted-foreground"
            >
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <Button
          data-testid="start-quiz-button"
          size="lg"
          onClick={onStart}
          className="w-full sm:w-auto"
        >
          Começar Quiz
        </Button>
      </div>
    </motion.div>
  );
}
