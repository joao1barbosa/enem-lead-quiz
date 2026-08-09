import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * Calculates the progress percentage (0-90) for the current question.
 * Question 1 = 0%, question 10 = 90% (10% increments).
 * Rounded to avoid floating-point artifacts.
 */
export function getProgressPercentage(current: number, total: number): number {
  return Math.round(((current - 1) / total) * 100);
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = getProgressPercentage(current, total);

  return (
    <div className="space-y-2">
      <div className="text-center text-sm font-medium text-muted-foreground">
        Pergunta {current} de {total}
      </div>
      {/* Radix Progress fornece role="progressbar" + aria-valuenow/min/max */}
      <Progress value={percentage} />
    </div>
  );
}
