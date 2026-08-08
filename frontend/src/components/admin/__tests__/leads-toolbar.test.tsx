import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadsToolbar } from '../leads-toolbar';

const defaultProps = {
  search: '',
  onSearchChange: vi.fn(),
  diagnostic: '',
  onDiagnosticChange: vi.fn(),
  onExport: vi.fn(),
};

describe('LeadsToolbar', () => {
  it('should render search input, diagnostic select and export button', () => {
    render(<LeadsToolbar {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Buscar por nome ou email...')
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument();
  });

  it('should show current search and diagnostic values', () => {
    render(
      <LeadsToolbar
        {...defaultProps}
        search="joao"
        diagnostic="ON_RIGHT_TRACK"
      />
    );

    expect(screen.getByPlaceholderText('Buscar por nome ou email...')).toHaveValue(
      'joao'
    );
    expect(screen.getByRole('combobox')).toHaveValue('ON_RIGHT_TRACK');
  });

  it('should call onSearchChange when typing', () => {
    const onSearchChange = vi.fn();
    render(<LeadsToolbar {...defaultProps} onSearchChange={onSearchChange} />);

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome ou email...'), {
      target: { value: 'jo' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('jo');
  });

  it('should call onDiagnosticChange when selecting a faixa', () => {
    const onDiagnosticChange = vi.fn();
    render(<LeadsToolbar {...defaultProps} onDiagnosticChange={onDiagnosticChange} />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'FINAL_STRETCH' },
    });

    expect(onDiagnosticChange).toHaveBeenCalledWith('FINAL_STRETCH');
  });

  it('should call onExport when clicking the export button', () => {
    const onExport = vi.fn();
    render(<LeadsToolbar {...defaultProps} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }));

    expect(onExport).toHaveBeenCalled();
  });
});
