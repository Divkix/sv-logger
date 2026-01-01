import { formatFullDate, formatRelativeTime, formatTimestamp, getTimeRangeStart } from './format';

describe('formatTimestamp', () => {
  it('returns HH:mm:ss.SSS format for afternoon time', () => {
    const date = new Date('2024-01-15T14:30:45.123Z');
    expect(formatTimestamp(date)).toBe('14:30:45.123');
  });

  it('returns HH:mm:ss.SSS format for morning time', () => {
    const date = new Date('2024-01-15T09:15:30.456Z');
    expect(formatTimestamp(date)).toBe('09:15:30.456');
  });

  it('handles midnight (00:00:00)', () => {
    const date = new Date('2024-01-15T00:00:00.000Z');
    expect(formatTimestamp(date)).toBe('00:00:00.000');
  });

  it('handles noon (12:00:00)', () => {
    const date = new Date('2024-01-15T12:00:00.000Z');
    expect(formatTimestamp(date)).toBe('12:00:00.000');
  });

  it('pads single-digit hours with leading zero', () => {
    const date = new Date('2024-01-15T01:05:08.100Z');
    expect(formatTimestamp(date)).toBe('01:05:08.100');
  });

  it('pads single-digit minutes with leading zero', () => {
    const date = new Date('2024-01-15T14:05:45.123Z');
    expect(formatTimestamp(date)).toBe('14:05:45.123');
  });

  it('pads single-digit seconds with leading zero', () => {
    const date = new Date('2024-01-15T14:30:05.123Z');
    expect(formatTimestamp(date)).toBe('14:30:05.123');
  });

  it('pads milliseconds to three digits', () => {
    const date1 = new Date('2024-01-15T14:30:45.001Z');
    expect(formatTimestamp(date1)).toBe('14:30:45.001');

    const date2 = new Date('2024-01-15T14:30:45.010Z');
    expect(formatTimestamp(date2)).toBe('14:30:45.010');

    const date3 = new Date('2024-01-15T14:30:45.100Z');
    expect(formatTimestamp(date3)).toBe('14:30:45.100');
  });

  it('handles maximum time values (23:59:59.999)', () => {
    const date = new Date('2024-01-15T23:59:59.999Z');
    expect(formatTimestamp(date)).toBe('23:59:59.999');
  });

  it('handles Date object at the start of epoch', () => {
    const date = new Date(0); // 1970-01-01T00:00:00.000Z
    expect(formatTimestamp(date)).toBe('00:00:00.000');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2024-01-15T14:30:45.000Z');

  describe('seconds range', () => {
    it('returns "just now" for times less than 5 seconds ago', () => {
      const date = new Date(now.getTime() - 4 * 1000);
      expect(formatRelativeTime(date, now)).toBe('just now');
    });

    it('returns "just now" for current time', () => {
      expect(formatRelativeTime(now, now)).toBe('just now');
    });

    it('returns "5 seconds ago" for 5 seconds ago', () => {
      const date = new Date(now.getTime() - 5 * 1000);
      expect(formatRelativeTime(date, now)).toBe('5 seconds ago');
    });

    it('returns "30 seconds ago" for 30 seconds ago', () => {
      const date = new Date(now.getTime() - 30 * 1000);
      expect(formatRelativeTime(date, now)).toBe('30 seconds ago');
    });

    it('returns "59 seconds ago" for 59 seconds ago', () => {
      const date = new Date(now.getTime() - 59 * 1000);
      expect(formatRelativeTime(date, now)).toBe('59 seconds ago');
    });
  });

  describe('minutes range', () => {
    it('returns "1 minute ago" for 60 seconds ago', () => {
      const date = new Date(now.getTime() - 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('1 minute ago');
    });

    it('returns "2 minutes ago" for 2 minutes ago', () => {
      const date = new Date(now.getTime() - 2 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('2 minutes ago');
    });

    it('returns "15 minutes ago" for 15 minutes ago', () => {
      const date = new Date(now.getTime() - 15 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('15 minutes ago');
    });

    it('returns "59 minutes ago" for 59 minutes ago', () => {
      const date = new Date(now.getTime() - 59 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('59 minutes ago');
    });
  });

  describe('hours range', () => {
    it('returns "1 hour ago" for 60 minutes ago', () => {
      const date = new Date(now.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('1 hour ago');
    });

    it('returns "2 hours ago" for 2 hours ago', () => {
      const date = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('2 hours ago');
    });

    it('returns "12 hours ago" for 12 hours ago', () => {
      const date = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('12 hours ago');
    });

    it('returns "23 hours ago" for 23 hours ago', () => {
      const date = new Date(now.getTime() - 23 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('23 hours ago');
    });
  });

  describe('days range', () => {
    it('returns "1 day ago" for 24 hours ago', () => {
      const date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('1 day ago');
    });

    it('returns "2 days ago" for 2 days ago', () => {
      const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('2 days ago');
    });

    it('returns "7 days ago" for 7 days ago', () => {
      const date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('7 days ago');
    });

    it('returns "30 days ago" for 30 days ago', () => {
      const date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date, now)).toBe('30 days ago');
    });
  });

  describe('edge cases', () => {
    it('handles future dates gracefully', () => {
      const futureDate = new Date(now.getTime() + 5 * 60 * 1000);
      // Should either return "just now" or a negative indication
      const result = formatRelativeTime(futureDate, now);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('uses current time when reference time is not provided', () => {
      const pastDate = new Date(Date.now() - 10 * 1000);
      const result = formatRelativeTime(pastDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});

describe('getTimeRangeStart', () => {
  const now = new Date('2024-01-15T14:30:45.123Z');

  describe('15 minutes range', () => {
    it('returns Date 15 minutes before reference time', () => {
      const result = getTimeRangeStart('15m', now);
      const expected = new Date(now.getTime() - 15 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('calculates correct timestamp for 15m', () => {
      const result = getTimeRangeStart('15m', now);
      expect(result.getTime()).toBe(now.getTime() - 15 * 60 * 1000);
    });
  });

  describe('1 hour range', () => {
    it('returns Date 1 hour before reference time', () => {
      const result = getTimeRangeStart('1h', now);
      const expected = new Date(now.getTime() - 60 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('calculates correct timestamp for 1h', () => {
      const result = getTimeRangeStart('1h', now);
      expect(result.getTime()).toBe(now.getTime() - 60 * 60 * 1000);
    });
  });

  describe('24 hours range', () => {
    it('returns Date 24 hours before reference time', () => {
      const result = getTimeRangeStart('24h', now);
      const expected = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('calculates correct timestamp for 24h', () => {
      const result = getTimeRangeStart('24h', now);
      expect(result.getTime()).toBe(now.getTime() - 24 * 60 * 60 * 1000);
    });
  });

  describe('7 days range', () => {
    it('returns Date 7 days before reference time', () => {
      const result = getTimeRangeStart('7d', now);
      const expected = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(result).toEqual(expected);
    });

    it('calculates correct timestamp for 7d', () => {
      const result = getTimeRangeStart('7d', now);
      expect(result.getTime()).toBe(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('default behavior', () => {
    it('uses current time when reference time is not provided', () => {
      const before = Date.now();
      const result = getTimeRangeStart('1h');
      const after = Date.now();

      // Result should be approximately 1 hour before now
      expect(result.getTime()).toBeGreaterThanOrEqual(before - 60 * 60 * 1000);
      expect(result.getTime()).toBeLessThanOrEqual(after - 60 * 60 * 1000);
    });
  });

  describe('return type validation', () => {
    it('returns a Date object for all valid ranges', () => {
      expect(getTimeRangeStart('15m', now)).toBeInstanceOf(Date);
      expect(getTimeRangeStart('1h', now)).toBeInstanceOf(Date);
      expect(getTimeRangeStart('24h', now)).toBeInstanceOf(Date);
      expect(getTimeRangeStart('7d', now)).toBeInstanceOf(Date);
    });
  });

  describe('precision verification', () => {
    it('preserves millisecond precision', () => {
      const result = getTimeRangeStart('1h', now);
      // If now has milliseconds, the result should maintain them
      expect(result.getMilliseconds()).toBe(now.getMilliseconds());
    });
  });
});

describe('formatFullDate', () => {
  it('returns YYYY-MM-DD HH:mm:ss.SSS UTC format', () => {
    const date = new Date('2024-01-15T14:30:45.123Z');
    expect(formatFullDate(date)).toBe('2024-01-15 14:30:45.123 UTC');
  });

  it('handles morning times correctly', () => {
    const date = new Date('2024-06-20T08:15:30.456Z');
    expect(formatFullDate(date)).toBe('2024-06-20 08:15:30.456 UTC');
  });

  it('handles midnight correctly', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(formatFullDate(date)).toBe('2024-01-01 00:00:00.000 UTC');
  });

  it('handles end of year correctly', () => {
    const date = new Date('2024-12-31T23:59:59.999Z');
    expect(formatFullDate(date)).toBe('2024-12-31 23:59:59.999 UTC');
  });

  it('pads single-digit months with leading zero', () => {
    const date = new Date('2024-01-15T14:30:45.123Z');
    expect(formatFullDate(date)).toContain('01-15');
  });

  it('pads single-digit days with leading zero', () => {
    const date = new Date('2024-01-05T14:30:45.123Z');
    expect(formatFullDate(date)).toContain('01-05');
  });

  it('handles epoch start', () => {
    const date = new Date(0); // 1970-01-01T00:00:00.000Z
    expect(formatFullDate(date)).toBe('1970-01-01 00:00:00.000 UTC');
  });

  it('handles double-digit months correctly', () => {
    const date = new Date('2024-11-20T14:30:45.123Z');
    expect(formatFullDate(date)).toBe('2024-11-20 14:30:45.123 UTC');
  });

  it('pads milliseconds to three digits', () => {
    const date1 = new Date('2024-01-15T14:30:45.001Z');
    expect(formatFullDate(date1)).toContain('.001 UTC');

    const date2 = new Date('2024-01-15T14:30:45.010Z');
    expect(formatFullDate(date2)).toContain('.010 UTC');
  });
});
