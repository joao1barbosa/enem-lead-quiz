import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  it('should render progress text', () => {
    render(<ProgressBar current={3} total={10} />);

    expect(screen.getByText('Pergunta 3 de 10')).toBeInTheDocument();
  });

  it('should render progress bar with correct width', () => {
    render(<ProgressBar current={3} total={10} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should calculate percentage correctly', () => {
    render(<ProgressBar current={5} total={10} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40');
  });

  it('should handle edge case: first question', () => {
    render(<ProgressBar current={1} total={10} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('should handle edge case: last question', () => {
    render(<ProgressBar current={10} total={10} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '90');
  });
});
