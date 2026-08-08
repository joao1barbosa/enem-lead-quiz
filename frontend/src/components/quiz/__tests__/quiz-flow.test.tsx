import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('should keep current question mounted during exit transition', () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));

    // With AnimatePresence mode="wait", the exiting question stays in the
    // DOM while its exit animation plays.
    expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
  });

  it('should show next question after transition completes', async () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));

    await waitFor(
      () => expect(screen.getByText('Pergunta 2')).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it('should navigate back to previous question', async () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));
    await waitFor(
      () => expect(screen.getByText('Pergunta 2')).toBeInTheDocument(),
      { timeout: 2000 }
    );

    fireEvent.click(screen.getByText('Anterior'));
    await waitFor(
      () => expect(screen.getByText('Pergunta 1')).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it('should show selected answer when navigating back', async () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 2'));
    fireEvent.click(screen.getByText('Próxima'));
    await waitFor(
      () => expect(screen.getByText('Pergunta 2')).toBeInTheDocument(),
      { timeout: 2000 }
    );
    fireEvent.click(screen.getByText('Anterior'));
    await waitFor(
      () => expect(screen.getByText('Pergunta 1')).toBeInTheDocument(),
      { timeout: 2000 }
    );

    const alternativa2Button = screen.getByText('Alternativa 2').closest('button');
    expect(alternativa2Button).toHaveClass('bg-primary');
  });

  it('should disable next button when no answer is selected', () => {
    render(<QuizFlow />);

    const nextButton = screen.getByText('Próxima');
    expect(nextButton).toBeDisabled();
  });

  it('should enable next button when answer is selected', () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    const nextButton = screen.getByText('Próxima');
    expect(nextButton).toBeEnabled();
  });

  it('should disable previous button on first question', () => {
    render(<QuizFlow />);

    const previousButton = screen.getByText('Anterior');
    expect(previousButton).toBeDisabled();
  });

  it('should enable previous button after navigating forward', () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));

    const previousButton = screen.getByText('Anterior');
    expect(previousButton).toBeEnabled();
  });

  it('should show lead form after answering last question', async () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));
    await waitFor(
      () => expect(screen.getByText('Pergunta 2')).toBeInTheDocument(),
      { timeout: 2000 }
    );

    fireEvent.click(screen.getByText('Alternativa 3'));
    fireEvent.click(screen.getByText('Ver Resultado'));

    await waitFor(
      () => expect(screen.getByText(/preencha seus dados/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
  });

  it('should store lead data and move to result stage on form submit', async () => {
    render(<QuizFlow />);

    fireEvent.click(screen.getByText('Alternativa 1'));
    fireEvent.click(screen.getByText('Próxima'));
    await waitFor(
      () => expect(screen.getByText('Pergunta 2')).toBeInTheDocument(),
      { timeout: 2000 }
    );
    fireEvent.click(screen.getByText('Alternativa 3'));
    fireEvent.click(screen.getByText('Ver Resultado'));
    await waitFor(
      () => expect(screen.getByLabelText(/nome/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.click(screen.getByText(/ver resultado/i));

    await waitFor(
      () => expect(useQuizStore.getState().stage).toBe('result'),
      { timeout: 2000 }
    );
    expect(useQuizStore.getState().leadData).toEqual({
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11999999999',
    });
  });
});
