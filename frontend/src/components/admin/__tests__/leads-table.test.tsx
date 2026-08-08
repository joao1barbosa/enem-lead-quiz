import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadsTable } from '../leads-table';

const LEADS = [
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
  {
    id: 'lead-2',
    name: 'Maria Souza',
    email: 'maria@email.com',
    phone: '11888888888',
    score: 40,
    diagnosticSlug: 'IN_CONSTRUCTION',
    diagnosticTitle: 'Em Construção',
    createdAt: '2026-08-06T12:00:00.000Z',
  },
];

describe('LeadsTable', () => {
  it('should render column headers', () => {
    render(<LeadsTable leads={LEADS} onLeadClick={vi.fn()} />);

    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Telefone')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Faixa')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  it('should render lead rows with formatted data', () => {
    render(<LeadsTable leads={LEADS} onLeadClick={vi.fn()} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    expect(screen.getByText('11999999999')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('Na Trilha Certa')).toBeInTheDocument();
    expect(screen.getByText('05/08/2026')).toBeInTheDocument();

    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('Em Construção')).toBeInTheDocument();
    expect(screen.getByText('06/08/2026')).toBeInTheDocument();
  });

  it('should call onLeadClick with the lead when a row is clicked', () => {
    const onLeadClick = vi.fn();
    render(<LeadsTable leads={LEADS} onLeadClick={onLeadClick} />);

    fireEvent.click(screen.getByText('Maria Souza'));

    expect(onLeadClick).toHaveBeenCalledWith(LEADS[1]);
  });
});
