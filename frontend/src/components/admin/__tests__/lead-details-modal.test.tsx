import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LeadDetailsModal } from '../lead-details-modal';
import * as api from '../../../lib/api';

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
    diagnosticMessage: 'Você está indo muito bem! Continue assim.',
  },
  answersSummary: [
    { questionText: 'Como você estuda para o ENEM?', selectedOptionText: 'Sozinho', score: 10 },
    { questionText: 'Quantas horas por semana?', selectedOptionText: '5-10 horas', score: 5 },
  ],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe('LeadDetailsModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render contact info, result and answers summary', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    render(<LeadDetailsModal leadId="lead-1" onClose={vi.fn()} />, { wrapper });

    expect(await screen.findByText('Informações de Contato')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    expect(screen.getByText('11999999999')).toBeInTheDocument();
    expect(screen.getByText('05/08/2026')).toBeInTheDocument();

    expect(screen.getByText('Resultado')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('Na Trilha Certa')).toBeInTheDocument();
    expect(
      screen.getByText('Você está indo muito bem! Continue assim.')
    ).toBeInTheDocument();

    expect(screen.getByText('Respostas')).toBeInTheDocument();
    expect(screen.getByText('Como você estuda para o ENEM?')).toBeInTheDocument();
    expect(screen.getByText(/Sozinho/)).toBeInTheDocument();
    expect(screen.getByText('Quantas horas por semana?')).toBeInTheDocument();
    expect(screen.getByText(/5-10 horas/)).toBeInTheDocument();
  });

  it('should show loading state while fetching details', () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    render(<LeadDetailsModal leadId="lead-1" onClose={vi.fn()} />, { wrapper });

    expect(screen.getByText('Carregando detalhes...')).toBeInTheDocument();
  });

  it('should call onClose when clicking the close button', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    const onClose = vi.fn();
    render(<LeadDetailsModal leadId="lead-1" onClose={onClose} />, { wrapper });

    await screen.findByText('Informações de Contato');
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking the overlay outside the modal', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    const onClose = vi.fn();
    const { container } = render(
      <LeadDetailsModal leadId="lead-1" onClose={onClose} />,
      { wrapper }
    );

    await screen.findByText('Informações de Contato');
    fireEvent.click(container.firstChild as Element);

    expect(onClose).toHaveBeenCalled();
  });
});
