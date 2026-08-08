import { describe, it, expect } from 'vitest';
import { ScoringCalculator } from '../scoring.calculator';
import { DiagnosticSlug } from '../diagnostic.enum';

describe('ScoringCalculator', () => {
  const calculator = new ScoringCalculator();

  it('should calculate total score correctly', () => {
    const answers = [{ score: 7 }, { score: 5 }, { score: 8 }];
    expect(calculator.calculate(answers)).toBe(20);
  });

  it('should return 0 for empty answers', () => {
    expect(calculator.calculate([])).toBe(0);
  });

  it.each([
    [0, DiagnosticSlug.STARTING_POINT],
    [25, DiagnosticSlug.STARTING_POINT],
    [26, DiagnosticSlug.IN_CONSTRUCTION],
    [50, DiagnosticSlug.IN_CONSTRUCTION],
    [51, DiagnosticSlug.ON_RIGHT_TRACK],
    [75, DiagnosticSlug.ON_RIGHT_TRACK],
    [76, DiagnosticSlug.FINAL_STRETCH],
    [100, DiagnosticSlug.FINAL_STRETCH],
  ])('should map score %i to diagnostic %s', (score, slug) => {
    expect(calculator.getDiagnostic(score).slug).toBe(slug);
  });
});
