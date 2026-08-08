import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDashboard } from '../use-dashboard';
import * as api from '../../lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard data from API', async () => {
    const mockDashboard = {
      totalLeads: 42,
      averageScore: 71.5,
      distributionByDiagnostic: [
        { slug: 'STARTING_POINT', title: 'Ponto de Partida', count: 5 },
        { slug: 'IN_CONSTRUCTION', title: 'Em Construção', count: 12 },
        { slug: 'ON_RIGHT_TRACK', title: 'Na Trilha Certa', count: 18 },
        { slug: 'FINAL_STRETCH', title: 'Reta Final', count: 7 },
      ],
      dailyLeads: [
        { date: '2026-08-01', count: 3 },
        { date: '2026-08-02', count: 5 },
      ],
    };

    vi.spyOn(api.api, 'get').mockResolvedValue({ data: mockDashboard });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDashboard);
    expect(api.api.get).toHaveBeenCalledWith('/api/admin/dashboard');
  });

  it('should handle API error', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
