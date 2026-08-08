import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagnosticDonut } from '../diagnostic-donut';

const DATA = [
  { slug: 'STARTING_POINT', title: 'Ponto de Partida', count: 5 },
  { slug: 'IN_CONSTRUCTION', title: 'Em Construção', count: 12 },
  { slug: 'ON_RIGHT_TRACK', title: 'Na Trilha Certa', count: 18 },
  { slug: 'FINAL_STRETCH', title: 'Reta Final', count: 7 },
];

describe('DiagnosticDonut', () => {
  it('should render the heading', () => {
    render(<DiagnosticDonut data={DATA} />);

    expect(screen.getByText('Distribuição por Faixa')).toBeInTheDocument();
  });

  it('should render all four diagnostic ranges in the legend', () => {
    render(<DiagnosticDonut data={DATA} />);

    expect(screen.getByText('Ponto de Partida')).toBeInTheDocument();
    expect(screen.getByText('Em Construção')).toBeInTheDocument();
    expect(screen.getByText('Na Trilha Certa')).toBeInTheDocument();
    expect(screen.getByText('Reta Final')).toBeInTheDocument();
  });

  it('should render when a faixa has zero leads', () => {
    const data = [
      { slug: 'STARTING_POINT', title: 'Ponto de Partida', count: 0 },
      { slug: 'ON_RIGHT_TRACK', title: 'Na Trilha Certa', count: 18 },
    ];

    render(<DiagnosticDonut data={data} />);

    expect(screen.getByText('Distribuição por Faixa')).toBeInTheDocument();
    expect(screen.getByText('Na Trilha Certa')).toBeInTheDocument();
  });
});
