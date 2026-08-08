import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
 */
export function DiagnosticDonut({ data }: DiagnosticDonutProps) {
  const chartData = data.map((item) => ({
    name: item.title,
    value: item.count,
    color: COLORS[item.slug as keyof typeof COLORS] || '#6b7280',
  }));

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Distribuição por Faixa</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
