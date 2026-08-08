import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSubmitLead } from '../use-submit-lead';
import * as api from '../../lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSubmitLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit lead data to API', async () => {
    const mockResult = {
      score: 75,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      diagnosticTitle: 'Na Trilha Certa',
      diagnosticMessage: 'Você está indo muito bem!',
      answersSummary: [
        { questionText: 'Pergunta 1', selectedOptionText: 'Alternativa 1' },
      ],
    };

    vi.spyOn(api.api, 'post').mockResolvedValue({ data: mockResult });

    const { result } = renderHook(() => useSubmitLead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      answers: [{ questionId: 'q1', alternativeId: 'a1' }],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResult);
    expect(api.api.post).toHaveBeenCalledWith('/api/leads', {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      answers: [{ questionId: 'q1', alternativeId: 'a1' }],
    });
  });

  it('should handle 409 duplicate email error', async () => {
    const error = {
      response: {
        status: 409,
        data: { message: 'Este e-mail já realizou o quiz.' },
      },
    };
    vi.spyOn(api.api, 'post').mockRejectedValue(error);

    const { result } = renderHook(() => useSubmitLead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      answers: [],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
