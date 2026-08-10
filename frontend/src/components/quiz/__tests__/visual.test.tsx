import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QuizFlow } from '../quiz-flow';
import { QuestionCard } from '../question-card';
import { ProgressBar } from '../progress-bar';
import { useQuizStore } from '../../../stores/quiz-store';

const { mockUseQuiz, mockSubmitLead } = vi.hoisted(() => ({
  mockUseQuiz: { data: undefined, isLoading: false, error: null },
  mockSubmitLead: { mutateAsync: vi.fn(), isPending: false },
}));

vi.mock('../../../hooks/use-quiz', () => ({
  useQuiz: () => mockUseQuiz,
}));

vi.mock('../../../hooks/use-submit-lead', () => ({
  useSubmitLead: () => mockSubmitLead,
}));

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

const mockQuiz = {
  id: 'test-quiz',
  questions: [mockQuestion],
};

describe('Visual regression', () => {
  it('should snapshot QuizFlow intro render', () => {
    useQuizStore.getState().setQuiz(mockQuiz);

    const { container } = render(<QuizFlow />);
    expect(container).toMatchSnapshot();
  });

  it('should snapshot QuizFlow question view', () => {
    useQuizStore.getState().setQuiz(mockQuiz);
    useQuizStore.getState().setStage('quiz');

    const { container } = render(<QuizFlow />);
    expect(container).toMatchSnapshot();
  });

  it('should snapshot QuestionCard initial render', () => {
    const { container } = render(
      <QuestionCard question={mockQuestion} selectedAnswer={null} onSelectAnswer={() => {}} />
    );
    expect(container).toMatchSnapshot();
  });

  it('should snapshot QuestionCard with selected answer', () => {
    const { container } = render(
      <QuestionCard question={mockQuestion} selectedAnswer="a3" onSelectAnswer={() => {}} />
    );
    expect(container).toMatchSnapshot();
  });

  it('should snapshot ProgressBar', () => {
    const { container } = render(<ProgressBar current={3} total={10} />);
    expect(container).toMatchSnapshot();
  });
});
