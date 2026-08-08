import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

/**
 * Card de indicador (KPI) do dashboard administrativo (RF-05, US-05).
 * Construído com o componente Card do shadcn/ui e tokens semânticos
 * (bg-card, text-card-foreground, border-border, text-muted-foreground).
 */
export function KpiCard({ title, value, icon: Icon, description }: KpiCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-card-foreground">{value}</div>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
