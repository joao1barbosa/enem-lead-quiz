import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * Calculates the progress percentage (0-100) for the current question.
 * Rounded to avoid floating-point artifacts (e.g. 1/3 * 100 = 33.333...).
 */
export function getProgressPercentage(current: number, total: number): number {
  return Math.round((current / total) * 100);
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = getProgressPercentage(current, total);

  return (
    <div className="space-y-2">
      <div className="text-center text-sm font-medium text-muted-foreground">
        Pergunta {current} de {total}
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
