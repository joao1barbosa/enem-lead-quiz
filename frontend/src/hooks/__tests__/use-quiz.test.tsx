import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useQuiz } from '../use-quiz';
import * as api from '../../lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch quiz from API', async () => {
    const mockQuiz = {
      quiz: {
        id: 'active-quiz',
        questions: [
          {
            id: 'q1',
            order: 1,
            text: 'Pergunta 1',
            alternatives: [{ id: 'a1', text: 'Alternativa 1' }],
          },
        ],
      },
    };

    vi.spyOn(api.api, 'get').mockResolvedValue({ data: mockQuiz });

    const { result } = renderHook(() => useQuiz(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockQuiz.quiz);
    expect(api.api.get).toHaveBeenCalledWith('/api/quizzes/active');
  });

  it('should handle API error', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useQuiz(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
