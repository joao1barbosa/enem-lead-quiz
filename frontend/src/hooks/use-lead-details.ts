import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface LeadDetails {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  result: {
    score: number;
    diagnosticSlug: string;
    diagnosticTitle: string;
    diagnosticMessage: string;
  };
  answersSummary: Array<{
    questionText: string;
    selectedOptionText: string;
    score: number;
  }>;
}

/**
 * Busca os detalhes completos de um lead (GET /api/admin/leads/:id) (RF-06, US-07).
 * Desabilitada enquanto não houver um lead selecionado (leadId null).
 */
export function useLeadDetails(leadId: string | null) {
  return useQuery<LeadDetails>({
    queryKey: ['lead-details', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('Lead ID is required');
      const response = await api.get(`/api/admin/leads/${leadId}`);
      return response.data;
    },
    enabled: !!leadId,
  });
}
