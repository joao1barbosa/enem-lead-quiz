import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLeadDetails } from '../use-lead-details';
import * as api from '../../lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLeadDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch lead details by id', async () => {
    const mockDetails = {
      contactInfo: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        createdAt: '2026-08-01T12:00:00.000Z',
      },
      result: {
        score: 75,
        diagnosticSlug: 'ON_RIGHT_TRACK',
        diagnosticTitle: 'Na Trilha Certa',
        diagnosticMessage: 'Você está indo muito bem!',
      },
      answersSummary: [
        { questionText: 'Pergunta 1', selectedOptionText: 'Alternativa 1', score: 10 },
      ],
    };

    vi.spyOn(api.api, 'get').mockResolvedValue({ data: mockDetails });

    const { result } = renderHook(() => useLeadDetails('lead-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDetails);
    expect(api.api.get).toHaveBeenCalledWith('/api/admin/leads/lead-1');
  });

  it('should not fetch when leadId is null', () => {
    const getSpy = vi.spyOn(api.api, 'get');

    const { result } = renderHook(() => useLeadDetails(null), {
      wrapper: createWrapper(),
    });

    expect(getSpy).not.toHaveBeenCalled();
    expect(result.current.isFetching).toBe(false);
  });

  it('should handle API error', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLeadDetails('lead-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
