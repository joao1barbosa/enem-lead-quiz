import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntroPage } from '../intro-page';

describe('IntroPage', () => {
  it('should render the quiz title and description with the question count', () => {
    render(<IntroPage totalQuestions={10} onStart={() => {}} />);

    expect(
      screen.getByRole('heading', { name: /descubra seu nível de preparo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Responda 10 perguntas rápidas e receba um diagnóstico personalizado do seu desempenho.'
      )
    ).toBeInTheDocument();
  });

  it('should render the benefits list', () => {
    render(<IntroPage totalQuestions={10} onStart={() => {}} />);

    expect(screen.getByText('Leva menos de 3 minutos')).toBeInTheDocument();
    expect(screen.getByText('Resultado imediato')).toBeInTheDocument();
    expect(screen.getByText('Dicas personalizadas')).toBeInTheDocument();
  });

  it('should call onStart when the start button is clicked', () => {
    const onStart = vi.fn();
    render(<IntroPage totalQuestions={10} onStart={onStart} />);

    fireEvent.click(screen.getByRole('button', { name: /começar quiz/i }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
