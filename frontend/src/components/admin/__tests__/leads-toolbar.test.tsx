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

/** Abre o Select (Radix) via teclado e clica em uma opção pelo texto visível. */
async function selectOption(optionName: string) {
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: optionName }));
}

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
    expect(screen.getByRole('combobox')).toHaveTextContent('Na Trilha Certa');
  });

  it('should show "Todas as faixas" when no diagnostic filter is set', () => {
    render(<LeadsToolbar {...defaultProps} diagnostic="" />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Todas as faixas');
  });

  it('should call onSearchChange when typing', () => {
    const onSearchChange = vi.fn();
    render(<LeadsToolbar {...defaultProps} onSearchChange={onSearchChange} />);

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome ou email...'), {
      target: { value: 'jo' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('jo');
  });

  it('should call onDiagnosticChange when selecting a faixa', async () => {
    const onDiagnosticChange = vi.fn();
    render(<LeadsToolbar {...defaultProps} onDiagnosticChange={onDiagnosticChange} />);

    await selectOption('Reta Final');

    expect(onDiagnosticChange).toHaveBeenCalledWith('FINAL_STRETCH');
  });

  it('should call onDiagnosticChange with empty value when resetting to "Todas as faixas"', async () => {
    const onDiagnosticChange = vi.fn();
    render(
      <LeadsToolbar
        {...defaultProps}
        diagnostic="FINAL_STRETCH"
        onDiagnosticChange={onDiagnosticChange}
      />
    );

    await selectOption('Todas as faixas');

    expect(onDiagnosticChange).toHaveBeenCalledWith('');
  });

  it('should call onExport when clicking the export button', () => {
    const onExport = vi.fn();
    render(<LeadsToolbar {...defaultProps} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }));

    expect(onExport).toHaveBeenCalled();
  });
});
