import { getLevelBgClass, getLevelColor } from './colors';

describe('getLevelColor', () => {
  it('returns correct HSL for debug level', () => {
    expect(getLevelColor('debug')).toBe('hsl(215, 15%, 50%)');
  });

  it('returns correct HSL for info level', () => {
    expect(getLevelColor('info')).toBe('hsl(210, 100%, 50%)');
  });

  it('returns correct HSL for warn level', () => {
    expect(getLevelColor('warn')).toBe('hsl(45, 100%, 50%)');
  });

  it('returns correct HSL for error level', () => {
    expect(getLevelColor('error')).toBe('hsl(0, 85%, 55%)');
  });

  it('returns correct HSL for fatal level', () => {
    expect(getLevelColor('fatal')).toBe('hsl(270, 70%, 55%)');
  });

  it('handles all log levels without throwing', () => {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'] as const;
    levels.forEach((level) => {
      expect(() => getLevelColor(level)).not.toThrow();
    });
  });

  it('returns string type for all levels', () => {
    expect(typeof getLevelColor('debug')).toBe('string');
    expect(typeof getLevelColor('info')).toBe('string');
    expect(typeof getLevelColor('warn')).toBe('string');
    expect(typeof getLevelColor('error')).toBe('string');
    expect(typeof getLevelColor('fatal')).toBe('string');
  });

  it('returns HSL format for all levels', () => {
    const hslPattern = /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/;
    expect(getLevelColor('debug')).toMatch(hslPattern);
    expect(getLevelColor('info')).toMatch(hslPattern);
    expect(getLevelColor('warn')).toMatch(hslPattern);
    expect(getLevelColor('error')).toMatch(hslPattern);
    expect(getLevelColor('fatal')).toMatch(hslPattern);
  });
});

describe('getLevelBgClass', () => {
  it('returns correct Tailwind class for debug level', () => {
    expect(getLevelBgClass('debug')).toBe('bg-slate-500/20');
  });

  it('returns correct Tailwind class for info level', () => {
    expect(getLevelBgClass('info')).toBe('bg-blue-500/20');
  });

  it('returns correct Tailwind class for warn level', () => {
    expect(getLevelBgClass('warn')).toBe('bg-amber-500/20');
  });

  it('returns correct Tailwind class for error level', () => {
    expect(getLevelBgClass('error')).toBe('bg-red-500/20');
  });

  it('returns correct Tailwind class for fatal level', () => {
    expect(getLevelBgClass('fatal')).toBe('bg-purple-500/20');
  });

  it('handles all log levels without throwing', () => {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'] as const;
    levels.forEach((level) => {
      expect(() => getLevelBgClass(level)).not.toThrow();
    });
  });

  it('returns string type for all levels', () => {
    expect(typeof getLevelBgClass('debug')).toBe('string');
    expect(typeof getLevelBgClass('info')).toBe('string');
    expect(typeof getLevelBgClass('warn')).toBe('string');
    expect(typeof getLevelBgClass('error')).toBe('string');
    expect(typeof getLevelBgClass('fatal')).toBe('string');
  });

  it('returns Tailwind bg-* class pattern for all levels', () => {
    const tailwindBgPattern = /^bg-[\w-]+\/\d+$/;
    expect(getLevelBgClass('debug')).toMatch(tailwindBgPattern);
    expect(getLevelBgClass('info')).toMatch(tailwindBgPattern);
    expect(getLevelBgClass('warn')).toMatch(tailwindBgPattern);
    expect(getLevelBgClass('error')).toMatch(tailwindBgPattern);
    expect(getLevelBgClass('fatal')).toMatch(tailwindBgPattern);
  });

  it('returns classes with opacity for visual hierarchy', () => {
    expect(getLevelBgClass('debug')).toContain('/20');
    expect(getLevelBgClass('info')).toContain('/20');
    expect(getLevelBgClass('warn')).toContain('/20');
    expect(getLevelBgClass('error')).toContain('/20');
    expect(getLevelBgClass('fatal')).toContain('/20');
  });

  it('maps to semantically correct color families', () => {
    expect(getLevelBgClass('debug')).toContain('slate');
    expect(getLevelBgClass('info')).toContain('blue');
    expect(getLevelBgClass('warn')).toContain('amber');
    expect(getLevelBgClass('error')).toContain('red');
    expect(getLevelBgClass('fatal')).toContain('purple');
  });
});
