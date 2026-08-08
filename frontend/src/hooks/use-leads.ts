import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  diagnosticSlug: string;
  diagnosticTitle: string;
  createdAt: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface UseLeadsParams {
  search?: string;
  diagnostic?: string;
  page?: number;
  limit?: number;
}

/**
 * Busca a lista paginada de leads (GET /api/admin/leads) com filtros de
 * busca textual e faixa diagnóstica (RF-06, US-06). Mantém os dados da página
 * anterior enquanto navega (placeholderData) para uma paginação fluida.
 */
export function useLeads(params: UseLeadsParams = {}) {
  const { search = '', diagnostic = '', page = 1, limit = 10 } = params;

  return useQuery<LeadsResponse>({
    queryKey: ['leads', { search, diagnostic, page, limit }],
    queryFn: async () => {
      const response = await api.get('/api/admin/leads', {
        params: { search, diagnostic, page, limit },
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}
