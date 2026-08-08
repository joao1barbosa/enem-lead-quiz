import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../question-card';

describe('QuestionCard', () => {
  const mockQuestion = {
    id: 'q1',
    order: 1,
    text: 'Qual é a capital do Brasil?',
    alternatives: [
      { id: 'a1', text: 'São Paulo' },
      { id: 'a2', text: 'Rio de Janeiro' },
      { id: 'a3', text: 'Brasília' },
      { id: 'a4', text: 'Salvador' },
    ],
  };

  it('should render question text', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={null}
        onSelectAnswer={() => {}}
      />
    );

    expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
  });

  it('should render all alternatives', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={null}
        onSelectAnswer={() => {}}
      />
    );

    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
    expect(screen.getByText('Brasília')).toBeInTheDocument();
    expect(screen.getByText('Salvador')).toBeInTheDocument();
  });

  it('should call onSelectAnswer when alternative is clicked', () => {
    const onSelectAnswer = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={null}
        onSelectAnswer={onSelectAnswer}
      />
    );

    fireEvent.click(screen.getByText('Brasília'));

    expect(onSelectAnswer).toHaveBeenCalledWith('q1', 'a3');
  });

  it('should highlight selected alternative', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer="a3"
        onSelectAnswer={() => {}}
      />
    );

    const brasiliaButton = screen.getByText('Brasília').closest('button');
    expect(brasiliaButton).toHaveClass('bg-primary');
  });
});
