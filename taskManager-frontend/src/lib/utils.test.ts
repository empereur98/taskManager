import { describe, it, expect } from 'vitest';
import { cn, formatDate } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
      expect(cn('px-2', { 'bg-red-500': true, 'hidden': false })).toBe('px-2 bg-red-500');
    });

    it('should handle Tailwind class conflicts', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });
  });

  describe('formatDate', () => {
    it('should format valid ISO date strings', () => {
      const result = formatDate('2026-01-15T10:30:00Z');
      expect(result).toBeDefined();
      expect(result).toContain('2026');
    });

    it('should return original string on invalid date', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });
  });
});
