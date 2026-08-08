import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizFlow } from '../quiz-flow';
import { useQuizStore } from '../../../stores/quiz-store';

describe('QuizFlow', () => {
  const mockQuiz = {
    id: 'test-quiz',
    questions: [
      {
        id: 'q1',
        order: 1,
        text: 'Pergunta 1',
        alternatives: [
          { id: 'a1', text: 'Alternativa 1' },
          { id: 'a2', text: 'Alternativa 2' },
        ],
      },
      {
        id: 'q2',
        order: 2,
        text: 'Pergunta 2',
        alternatives: [
          { id: 'a3', text: 'Alternativa 3' },
          { id: 'a4', text: 'Alternativa 4' },
        ],
      },
    ],
  };

  beforeEach(() => {
    useQuizStore.getState().reset();
    useQuizStore.getState().setQuiz(mockQuiz);
  });

  it('should render first question', () => {
    render(<QuizFlow />);

    expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
  });

  it('should navigate to next question', () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));

    expect(screen.getByText('Pergunta 2')).toBeInTheDocument();
  });

  it('should navigate to previous question', () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Próxima'));
    fireEvent.click(screen.getByText('Anterior'));

    expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
  });

  it('should show selected answer when navigating back', () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 2'));
    fireEvent.click(screen.getByText('Próxima'));
    fireEvent.click(screen.getByText('Anterior'));

    const alternativa2Button = screen.getByText('Alternativa 2').closest('button');
    expect(alternativa2Button).toHaveClass('bg-primary');
  });
});
