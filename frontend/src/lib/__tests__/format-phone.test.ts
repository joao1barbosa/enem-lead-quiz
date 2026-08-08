import { describe, it, expect } from 'vitest';
import { formatPhone } from '../format-phone';

describe('formatPhone', () => {
  it('formats 11-digit phone number', () => {
    expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
  });

  it('formats phone with special characters', () => {
    expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
  });

  it('returns original if not 11 digits', () => {
    expect(formatPhone('123')).toBe('123');
  });

  it('returns original if empty', () => {
    expect(formatPhone('')).toBe('');
  });
});
