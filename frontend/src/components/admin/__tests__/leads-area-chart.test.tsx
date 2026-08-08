import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadsAreaChart } from '../leads-area-chart';

const DATA = [
  { date: '2026-08-01', count: 3 },
  { date: '2026-08-02', count: 5 },
  { date: '2026-08-03', count: 2 },
];

describe('LeadsAreaChart', () => {
  it('should render the heading', () => {
    render(<LeadsAreaChart data={DATA} />);

    expect(screen.getByText('Leads por Dia (Últimos 30 dias)')).toBeInTheDocument();
  });

  it('should format dates as dd/MM on the x-axis', () => {
    render(<LeadsAreaChart data={DATA} />);

    expect(screen.getByText('01/08')).toBeInTheDocument();
    expect(screen.getByText('02/08')).toBeInTheDocument();
    expect(screen.getByText('03/08')).toBeInTheDocument();
  });
});
