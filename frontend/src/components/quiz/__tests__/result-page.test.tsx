import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultPage } from '../result-page';

describe('ResultPage', () => {
  const mockResult = {
    score: 75,
    diagnosticSlug: 'ON_RIGHT_TRACK',
    diagnosticTitle: 'Na Trilha Certa',
    diagnosticMessage: 'Você está indo muito bem! Continue assim.',
    answersSummary: [
      { questionText: 'Qual é a capital do Brasil?', selectedOptionText: 'Brasília' },
      { questionText: 'Quanto é 2 + 2?', selectedOptionText: '4' },
    ],
  };

  it('should render score', () => {
    render(<ResultPage result={mockResult} />);

    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('should render diagnostic title', () => {
    render(<ResultPage result={mockResult} />);

    expect(screen.getByText('Na Trilha Certa')).toBeInTheDocument();
  });

  it('should render diagnostic message', () => {
    render(<ResultPage result={mockResult} />);

    expect(
      screen.getByText('Você está indo muito bem! Continue assim.')
    ).toBeInTheDocument();
  });

  it('should toggle answers summary on button click', async () => {
    render(<ResultPage result={mockResult} />);

    // Answers hidden by default
    expect(screen.queryByText('Qual é a capital do Brasil?')).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(screen.getByRole('button', { name: 'Ver respostas' }));
    expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
    expect(screen.getByText('Brasília')).toBeInTheDocument();
    expect(screen.getByText('Quanto é 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar respostas' }));
    expect(screen.queryByText('Qual é a capital do Brasil?')).not.toBeInTheDocument();
  });
});
