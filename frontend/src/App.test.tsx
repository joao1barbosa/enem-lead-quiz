import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import { api } from './lib/api';
import { useQuizStore } from './stores/quiz-store';
import type { Quiz } from './types/quiz';

vi.mock('./lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockQuizResponse: { quiz: Quiz } = {
  quiz: {
    id: 'active-quiz',
    questions: [
      {
        id: 'q1',
        order: 1,
        text: 'Qual é a capital do Brasil?',
        alternatives: [
          { id: 'q1a1', text: 'São Paulo' },
          { id: 'q1a2', text: 'Rio de Janeiro' },
          { id: 'q1a3', text: 'Brasília' },
          { id: 'q1a4', text: 'Salvador' },
        ],
      },
    ],
  },
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuizStore.getState().reset();
  });

  it('shows the intro screen and starts the quiz from the first question', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockQuizResponse,
    });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /começar quiz/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /começar quiz/i }));

    await waitFor(() => {
      expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
    });
    expect(screen.getByText('Pergunta 1 de 1')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/api/quizzes/active');
  });
});
