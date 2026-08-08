import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface DiagnosticDonutProps {
  data: Array<{
    slug: string;
    title: string;
    count: number;
  }>;
}

const COLORS = {
  STARTING_POINT: '#ef4444', // red
  IN_CONSTRUCTION: '#f59e0b', // amber
  ON_RIGHT_TRACK: '#3b82f6', // blue
  FINAL_STRETCH: '#10b981', // green
};

/**
 * Gráfico donut com a distribuição de leads por faixa de diagnóstico (RF-05, US-05).
 * Cada faixa tem uma cor distinta; slugs desconhecidos caem para cinza.
 *
 * A legenda é renderizada em HTML (fora do recharts) para quebrar linha
 * naturalmente: horizontal sob o gráfico no mobile e vertical à direita no
 * desktop. `cx` fixo em 50% e raios percentuais escalam com o container.
 */
export function DiagnosticDonut({ data }: DiagnosticDonutProps) {
  const chartData = data.map((item) => ({
    name: item.title,
    value: item.count,
    color: COLORS[item.slug as keyof typeof COLORS] || '#6b7280',
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribuição por Faixa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <div className="h-[250px] w-full sm:h-[300px] sm:w-3/5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:flex-col sm:items-start">
            {chartData.map((item) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
              return (
                <li key={item.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name} · {pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
