import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNavigation } from '../bottom-nav';

describe('BottomNavigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render navigation links for Dashboard and Leads', () => {
    render(
      <MemoryRouter>
        <BottomNavigation />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute(
      'href',
      '/admin/dashboard'
    );
    expect(screen.getByText('Leads').closest('a')).toHaveAttribute(
      'href',
      '/admin/leads'
    );
  });

  it('should highlight the active menu item', () => {
    render(
      <MemoryRouter initialEntries={['/admin/leads']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    expect(screen.getByText('Leads').closest('a')).toHaveClass('text-blue-600');
    expect(screen.getByText('Dashboard').closest('a')).not.toHaveClass('text-blue-600');
  });
});
