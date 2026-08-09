import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreCircle, getDiagnosticColor } from '../score-circle';

describe('getDiagnosticColor', () => {
  it('returns the color for each diagnostic band', () => {
    expect(getDiagnosticColor(10)).toBe('#ef4444');
    expect(getDiagnosticColor(35)).toBe('#f59e0b');
    expect(getDiagnosticColor(60)).toBe('#3b82f6');
    expect(getDiagnosticColor(90)).toBe('#10b981');
  });
});

describe('ScoreCircle', () => {
  it('renders the score text in the center', () => {
    render(<ScoreCircle score={75} />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it.each([
    [10, '#ef4444'],
    [35, '#f59e0b'],
    [60, '#3b82f6'],
    [90, '#10b981'],
  ])('uses the correct border color for score %i', (score, expected) => {
    render(<ScoreCircle score={score} />);
    expect(
      screen.getByTestId('score-circle-progress').getAttribute('stroke')
    ).toBe(expected);
  });

  it('fills the border proportionally (score 50 = half the circumference)', () => {
    render(<ScoreCircle score={50} />);
    const radius = (160 - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = parseFloat(
      screen.getByTestId('score-circle-progress').getAttribute('stroke-dashoffset')!
    );
    expect(offset).toBeCloseTo(circumference / 2, 5);
  });

  it('leaves the border empty for score 0', () => {
    render(<ScoreCircle score={0} />);
    const circumference = 2 * Math.PI * ((160 - 12) / 2);
    const offset = parseFloat(
      screen.getByTestId('score-circle-progress').getAttribute('stroke-dashoffset')!
    );
    expect(offset).toBeCloseTo(circumference, 5);
  });

  it('fills the border completely for score 100', () => {
    render(<ScoreCircle score={100} />);
    const offset = parseFloat(
      screen.getByTestId('score-circle-progress').getAttribute('stroke-dashoffset')!
    );
    expect(offset).toBeCloseTo(0, 5);
  });

  it('renders with a custom size', () => {
    const { container } = render(<ScoreCircle score={75} size={200} />);
    const svg = screen.getByTestId('score-circle');
    expect(svg.getAttribute('width')).toBe('200');
    expect(svg.getAttribute('height')).toBe('200');
    expect(container.firstChild).toHaveStyle({ width: '200px' });
  });
});
