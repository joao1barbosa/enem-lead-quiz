import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLeads } from '../use-leads';
import * as api from '../../lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Default do setup.ts (desktop). Restaurado após testes que simulam mobile.
const desktopMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = desktopMatchMedia;
});

describe('useLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch paginated leads with default params', async () => {
    const mockResponse = {
      leads: [
        {
          id: 'lead-1',
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '11999999999',
          score: 75,
          diagnosticSlug: 'ON_RIGHT_TRACK',
          diagnosticTitle: 'Na Trilha Certa',
          createdAt: '2026-08-01T12:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    };

    vi.spyOn(api.api, 'get').mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.api.get).toHaveBeenCalledWith('/api/admin/leads', {
      params: { search: '', diagnostic: '', page: 1, limit: 10 },
    });
  });

  it('should fetch leads with search, diagnostic and pagination filters', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: { leads: [], total: 0, page: 2, limit: 10 },
    });

    const { result } = renderHook(
      () => useLeads({ search: 'joao', diagnostic: 'ON_RIGHT_TRACK', page: 2, limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.api.get).toHaveBeenCalledWith('/api/admin/leads', {
      params: { search: 'joao', diagnostic: 'ON_RIGHT_TRACK', page: 2, limit: 10 },
    });
  });

  it('should handle API error', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should default to 5 leads per page on mobile viewport', async () => {
    // Simula viewport mobile (max-width: 767px) — paginação responsiva (RNF-03)
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: { leads: [], total: 0, page: 1, limit: 5 },
    });

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.api.get).toHaveBeenCalledWith('/api/admin/leads', {
      params: { search: '', diagnostic: '', page: 1, limit: 5 },
    });
  });
});
