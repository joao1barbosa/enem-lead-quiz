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
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
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

  it('should show a skeleton while fetching details', () => {
    vi.spyOn(api.api, 'get').mockReturnValue(new Promise(() => {}));
    render(<LeadDetailsModal leadId="lead-1" onClose={vi.fn()} />, {
      wrapper,
    });

    // O Dialog do Radix renderiza via portal: consultar document, não container.
    expect(screen.getByTestId('lead-details-skeleton')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should show an error fallback with close button when fetch fails', async () => {
    vi.spyOn(api.api, 'get').mockRejectedValue(new Error('Network error'));
    const onClose = vi.fn();
    render(<LeadDetailsModal leadId="lead-1" onClose={onClose} />, { wrapper });

    expect(
      await screen.findByText('Erro ao carregar detalhes do lead')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('details-error-close'));
    expect(onClose).toHaveBeenCalled();
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
    render(<LeadDetailsModal leadId="lead-1" onClose={onClose} />, { wrapper });

    await screen.findByText('Informações de Contato');
    // O Dialog do Radix renderiza via portal e fecha por pointer-down fora
    // do conteúdo (o overlay é renderizado como irmão do conteúdo).
    fireEvent.pointerDown(document.body);

    expect(onClose).toHaveBeenCalled();
  });

  it('should expose native dialog semantics (role and aria-labelledby)', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    render(<LeadDetailsModal leadId="lead-1" onClose={vi.fn()} />, { wrapper });

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');

    const titleId = dialog.getAttribute('aria-labelledby');
    expect(screen.getByText('Detalhes do Lead').closest('h2')).toHaveAttribute(
      'id',
      titleId
    );
  });

  it('should call onClose when pressing Escape', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    const onClose = vi.fn();
    render(<LeadDetailsModal leadId="lead-1" onClose={onClose} />, { wrapper });

    const dialog = await screen.findByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('should focus the close button when opened', async () => {
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: DETAILS });
    render(<LeadDetailsModal leadId="lead-1" onClose={vi.fn()} />, { wrapper });

    await screen.findByText('Informações de Contato');
    expect(screen.getByRole('button', { name: /fechar/i })).toHaveFocus();
  });
});
