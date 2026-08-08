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
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="45%"
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
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              content={({ payload }) => {
                const total = chartData.reduce((sum, d) => sum + d.value, 0);
                return (
                  <ul className="space-y-1">
                    {payload?.map((entry, i) => {
                      const item = chartData[i];
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                      return (
                        <li key={entry.value} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>{item.name} · {pct}%</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
