import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  /** Quando true, exibe um Skeleton no lugar do valor (loading). */
  loading?: boolean;
}

/**
 * Card de indicador (KPI) do dashboard administrativo (RF-05, US-05).
 * Construído com o componente Card do shadcn/ui e tokens semânticos
 * (bg-card, text-card-foreground, border-border, text-muted-foreground).
 */
export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: KpiCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <div className="text-3xl font-bold text-card-foreground">{value}</div>
        )}
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
