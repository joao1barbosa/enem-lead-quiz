import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadsAreaChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Formata 'YYYY-MM-DD' para 'dd/MM' de forma determinística, sem depender do
 * fuso horário do ambiente (new Date('YYYY-MM-DD') é interpretado em UTC e
 * `toLocaleDateString` deslocaria o dia anterior em fusos negativos).
 */
function formatDayMonth(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

/**
 * Gráfico de área com a evolução diária de leads (últimos 30 dias) (RF-05, US-05).
 */
export function LeadsAreaChart({ data }: LeadsAreaChartProps) {
  const formattedData = data.map((item) => ({
    date: formatDayMonth(item.date),
    count: item.count,
  }));

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Leads por Dia (Últimos 30 dias)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
