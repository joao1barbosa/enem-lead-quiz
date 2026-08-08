import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface DashboardData {
  totalLeads: number;
  qualifiedLeads: number;
  averageScore: number;
  distributionByDiagnostic: Array<{
    slug: string;
    title: string;
    count: number;
  }>;
  dailyLeads: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Busca os dados do dashboard administrativo (GET /api/admin/dashboard) (RF-05, US-05).
 * Os dados ficam frescos por 30 segundos para evitar chamadas excessivas.
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/api/admin/dashboard');
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
}
