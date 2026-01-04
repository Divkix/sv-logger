import { describe, expect, it } from 'vitest';

describe('Example Unit Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings', () => {
    const greeting = 'Hello, Logwell!';
    expect(greeting).toContain('Logwell');
  });
});
