import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

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
 * Gráfico de área com a evolução diária de leads (últimos 7 dias) (RF-05, US-05).
 * Usa o Card do shadcn/ui e altura responsiva (250px mobile, 300px desktop).
 */
export function LeadsAreaChart({ data }: LeadsAreaChartProps) {
  if (data.length === 0) {
    return (
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Leads por Dia</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Sem dados no período
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    date: formatDayMonth(item.date),
    count: item.count,
  }));

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Leads por Dia</CardTitle>
        <CardDescription>Últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}  margin={{ left: -6, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={8} />
              <YAxis width={30} />
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
      </CardContent>
    </Card>
  );
}
