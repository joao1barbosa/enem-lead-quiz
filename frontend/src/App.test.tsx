import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the quiz application title', () => {
    render(<App />);
    expect(screen.getByText('ENEM Lead Quiz')).toBeInTheDocument();
  });

  it('loads the mock quiz and renders the first question', () => {
    render(<App />);
    expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
    expect(screen.getByText('Pergunta 1 de 10')).toBeInTheDocument();
  });
});
