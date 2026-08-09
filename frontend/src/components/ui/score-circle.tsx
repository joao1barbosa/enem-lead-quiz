/**
 * Círculo de score (US-03): exibe a pontuação com borda circular preenchida
 * proporcionalmente ao score e cor determinada pela faixa diagnóstica.
 */

/**
 * Retorna a cor hex da faixa diagnóstica para um score 0-100.
 * - 0-25: red-500 (#ef4444, diagnostic-starting)
 * - 26-50: amber-500 (#f59e0b, diagnostic-construction)
 * - 51-75: blue-500 (#3b82f6, diagnostic-track)
 * - 76-100: emerald-500 (#10b981, diagnostic-stretch)
 */
export function getDiagnosticColor(score: number): string {
  if (score <= 25) return '#ef4444';
  if (score <= 50) return '#f59e0b';
  if (score <= 75) return '#3b82f6';
  return '#10b981';
}

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreCircle({
  score,
  size = 160,
  strokeWidth = 12,
}: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = getDiagnosticColor(score);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        data-testid="score-circle"
        className="-rotate-90"
        role="img"
        aria-label={`Pontuação: ${score}`}
      >
        <circle
          data-testid="score-circle-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
          opacity={0.3}
        />
        <circle
          data-testid="score-circle-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold"
        style={{ color, fontSize: Math.round(size * 0.28) }}
      >
        {score}
      </span>
    </div>
  );
}
