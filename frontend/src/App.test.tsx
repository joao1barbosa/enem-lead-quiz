import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing and shows the loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});
