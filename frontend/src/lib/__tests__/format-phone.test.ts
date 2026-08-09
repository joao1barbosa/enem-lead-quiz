import { describe, it, expect } from 'vitest';
import { formatPhone, formatPhoneInput } from '../format-phone';

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

describe('formatPhoneInput', () => {
  it('returns empty string for empty input', () => {
    expect(formatPhoneInput('')).toBe('');
  });

  it('formats 1-2 digits as area code', () => {
    expect(formatPhoneInput('1')).toBe('(1');
    expect(formatPhoneInput('11')).toBe('(11');
  });

  it('formats 3-7 digits with DDD and number prefix', () => {
    expect(formatPhoneInput('119')).toBe('(11) 9');
    expect(formatPhoneInput('1199999')).toBe('(11) 99999');
  });

  it('formats 8-11 digits fully', () => {
    expect(formatPhoneInput('11999999999')).toBe('(11) 99999-9999');
    expect(formatPhoneInput('1199999999')).toBe('(11) 99999-999');
  });

  it('strips non-digit characters', () => {
    expect(formatPhoneInput('(11) 99999-9999')).toBe('(11) 99999-9999');
    expect(formatPhoneInput('11a9b99999999')).toBe('(11) 99999-9999');
  });

  it('limits to 11 digits', () => {
    expect(formatPhoneInput('119999999991234')).toBe('(11) 99999-9999');
  });
});
