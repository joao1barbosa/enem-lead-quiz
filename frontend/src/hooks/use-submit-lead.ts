import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { LeadResult } from '../types/quiz';

export interface SubmitLeadData {
  name: string;
  email: string;
  phone: string;
  answers: Array<{ questionId: string; alternativeId: string }>;
}

/**
 * Envia os dados do lead + respostas para o backend (POST /api/leads).
 * Retorna o resultado do diagnóstico (score + faixa + resumo) (RF-03).
 * Erros HTTP (ex.: 409 email duplicado) propagam como exceção da mutation.
 */
export function useSubmitLead() {
  return useMutation<LeadResult, Error, SubmitLeadData>({
    mutationFn: async (data) => {
      const { data: result } = await api.post<LeadResult>('/api/leads', data);
      return result;
    },
  });
}
