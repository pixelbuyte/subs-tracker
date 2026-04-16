import { describe, expect, it } from 'vitest';

import { csvEscapeCell } from '@/lib/csv';

describe('csvEscapeCell', () => {
  it('returns empty string for nullish values', () => {
    expect(csvEscapeCell(null)).toBe('');
    expect(csvEscapeCell(undefined)).toBe('');
  });

  it('escapes commas, quotes, and newlines', () => {
    expect(csvEscapeCell('hello,world')).toBe('"hello,world"');
    expect(csvEscapeCell('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvEscapeCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('neutralizes formula-like prefixes', () => {
    expect(csvEscapeCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(csvEscapeCell('+1+2')).toBe("'+1+2");
    expect(csvEscapeCell('-2+3')).toBe("'-2+3");
    expect(csvEscapeCell('@cmd')).toBe("'@cmd");
    expect(csvEscapeCell(' \t=calc')).toBe("' \t=calc");
  });

  it('does not alter regular text', () => {
    expect(csvEscapeCell('Netflix')).toBe('Netflix');
    expect(csvEscapeCell('Plan 2026')).toBe('Plan 2026');
  });
});
