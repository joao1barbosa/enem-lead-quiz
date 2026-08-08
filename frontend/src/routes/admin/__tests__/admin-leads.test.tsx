import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AdminLeads } from '../admin-leads';
import * as api from '../../../lib/api';

vi.mock('../../../lib/export-csv', () => ({
  exportLeadsCsv: vi.fn(),
}));

import { exportLeadsCsv } from '../../../lib/export-csv';

const PAGE_1 = {
  leads: [
    {
      id: 'lead-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
      score: 75,
      diagnosticSlug: 'ON_RIGHT_TRACK',
      diagnosticTitle: 'Na Trilha Certa',
      createdAt: '2026-08-05T12:00:00.000Z',
    },
  ],
  total: 12,
  page: 1,
  limit: 10,
};

const PAGE_2 = {
  ...PAGE_1,
  leads: [
    {
      id: 'lead-11',
      name: 'Ana Pereira',
      email: 'ana@email.com',
      phone: '11777777777',
      score: 55,
      diagnosticSlug: 'STARTING_POINT',
      diagnosticTitle: 'Ponto de Partida',
      createdAt: '2026-08-01T12:00:00.000Z',
    },
  ],
  page: 2,
};

const DETAILS = {
  contactInfo: {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    createdAt: '2026-08-05T12:00:00.000Z',
  },
  result: {
    score: 75,
    diagnosticSlug: 'ON_RIGHT_TRACK',
    diagnosticTitle: 'Na Trilha Certa',
    diagnosticMessage: 'Você está indo muito bem!',
  },
  answersSummary: [],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe('AdminLeads', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(exportLeadsCsv).mockReset();
  });

  it('should show a loading message while fetching', () => {
    vi.spyOn(api.api, 'get').mockReturnValue(new Promise(() => {}));
    render(<AdminLeads />, { wrapper });

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should render toolbar, table and pagination after loading', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: PAGE_1 });
    render(<AdminLeads />, { wrapper });

    expect(
      await screen.findByPlaceholderText('Buscar por nome ou email...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1-10 de 12 leads')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /próxima/i })).toBeEnabled();
  });

  it('should paginate to the next page', async () => {
    const getSpy = vi
      .spyOn(api.api, 'get')
      .mockResolvedValueOnce({ data: PAGE_1 })
      .mockResolvedValueOnce({ data: PAGE_2 });

    render(<AdminLeads />, { wrapper });

    await screen.findByText('João Silva');
    fireEvent.click(screen.getByRole('button', { name: /próxima/i }));

    expect(await screen.findByText('Ana Pereira')).toBeInTheDocument();
    expect(getSpy).toHaveBeenLastCalledWith('/api/admin/leads', {
      params: { search: '', diagnostic: '', page: 2, limit: 10 },
    });
    expect(screen.getByRole('button', { name: /próxima/i })).toBeDisabled();
  });

  it('should open the details modal when a lead row is clicked', async () => {
    vi.spyOn(api.api, 'get').mockImplementation((url: string) => {
      if (url === '/api/admin/leads') return Promise.resolve({ data: PAGE_1 });
      if (url === '/api/admin/leads/lead-1') return Promise.resolve({ data: DETAILS });
      return Promise.resolve({ data: {} });
    });

    render(<AdminLeads />, { wrapper });

    fireEvent.click(await screen.findByText('João Silva'));

    expect(await screen.findByText('Detalhes do Lead')).toBeInTheDocument();
    expect(screen.getByText('joao@email.com')).toBeInTheDocument();
  });

  it('should show an error message when the request fails', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));
    render(<AdminLeads />, { wrapper });

    expect(await screen.findByText('Erro ao carregar leads')).toBeInTheDocument();
  });

  it('should call exportLeadsCsv with the current filters when exporting', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: PAGE_1 });
    render(<AdminLeads />, { wrapper });

    await screen.findByText('João Silva');
    fireEvent.change(screen.getByPlaceholderText('Buscar por nome ou email...'), {
      target: { value: 'ana' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'STARTING_POINT' },
    });
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }));

    await waitFor(() => {
      expect(exportLeadsCsv).toHaveBeenCalledWith({
        search: 'ana',
        diagnostic: 'STARTING_POINT',
      });
    });
  });
});
