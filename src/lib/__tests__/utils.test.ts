import { describe, it, expect } from 'vitest';
import { cn, uid, timeAgo, formatDate, formatMinutes, formatPercent, formatSeconds, initials, truncate, clamp } from '../utils';

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cn('a', 'b', false, undefined, null, 'c')).toBe('a b c');
    expect(cn('')).toBe('');
  });
});

describe('uid', () => {
  it('prepends the given prefix and produces unique ids', () => {
    const a = uid('q');
    const b = uid('q');
    expect(a).toMatch(/^q/);
    expect(a).not.toBe(b);
  });
});

describe('initials', () => {
  it('derives up to two initials from a name', () => {
    expect(initials('Amina Benali')).toBe('AB');
    expect(initials('Amina')).toBe('A');
    expect(initials('')).toBe('');
  });
});

describe('formatMinutes / formatSeconds', () => {
  it('formats durations', () => {
    expect(formatMinutes(125)).toBe('2:05');
    expect(formatSeconds(65)).toBe('1m 5s');
    expect(formatSeconds(59)).toBe('59s');
  });
});

describe('formatPercent', () => {
  it('appends a percent sign and rounds', () => {
    expect(formatPercent(87.4)).toBe('87%');
  });
});

describe('formatDate', () => {
  it('formats a timestamp without throwing', () => {
    expect(formatDate(1700000000000)).toMatch(/\d/);
  });
});

describe('truncate', () => {
  it('truncates long strings with an ellipsis and keeps short ones intact', () => {
    expect(truncate('short')).toBe('short');
    expect(truncate('x'.repeat(200), 10)).toBe(`${'x'.repeat(10)}…`);
  });
});

describe('clamp', () => {
  it('clamps values to the given range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('timeAgo', () => {
  it('returns a humanized string for a recent timestamp', () => {
    expect(timeAgo(Date.now() - 60_000)).toMatch(/minute|ago|just/);
  });
});