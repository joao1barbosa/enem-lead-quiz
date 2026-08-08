import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { KpiCard } from '../kpi-card';

describe('KpiCard', () => {
  it('should render title, value, icon and description', () => {
    const { container } = render(
      <KpiCard
        title="Total de Leads"
        value={42}
        icon={Users}
        description="Leads capturados"
      />
    );

    expect(screen.getByText('Total de Leads')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Leads capturados')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render without description when omitted', () => {
    render(<KpiCard title="Total de Leads" value={42} icon={Users} />);

    expect(screen.getByText('Total de Leads')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('Leads capturados')).not.toBeInTheDocument();
  });
});
