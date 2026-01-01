import { describe, expect, it } from 'vitest';
import {
  batchLogPayloadSchema,
  LOG_LEVELS,
  type LogLevel,
  logLevelSchema,
  logPayloadSchema,
} from './log';

describe('logLevelSchema', () => {
  it('should accept all valid log levels', () => {
    for (const level of LOG_LEVELS) {
      const result = logLevelSchema.safeParse(level);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid log level', () => {
    const result = logLevelSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('logPayloadSchema', () => {
  it('should accept valid log payload with all fields', () => {
    const payload = {
      level: 'info' as LogLevel,
      message: 'Test message',
      metadata: { key: 'value', nested: { data: 123 } },
      source_file: 'app.ts',
      line_number: 42,
      request_id: 'req-123',
      user_id: 'user-456',
      ip_address: '192.168.1.1',
      timestamp: '2024-01-01T12:00:00.000Z',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.level).toBe('info');
      expect(result.data.message).toBe('Test message');
      expect(result.data.metadata).toEqual({ key: 'value', nested: { data: 123 } });
      expect(result.data.sourceFile).toBe('app.ts');
      expect(result.data.lineNumber).toBe(42);
      expect(result.data.requestId).toBe('req-123');
      expect(result.data.userId).toBe('user-456');
      expect(result.data.ipAddress).toBe('192.168.1.1');
      expect(result.data.timestamp).toBeInstanceOf(Date);
    }
  });

  it('should accept valid log payload with only required fields', () => {
    const payload = {
      level: 'error' as LogLevel,
      message: 'Error occurred',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.level).toBe('error');
      expect(result.data.message).toBe('Error occurred');
      expect(result.data.metadata).toBeUndefined();
    }
  });

  it('should reject invalid log level', () => {
    const payload = {
      level: 'invalid',
      message: 'Test message',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject empty message', () => {
    const payload = {
      level: 'info' as LogLevel,
      message: '',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject missing message', () => {
    const payload = {
      level: 'info' as LogLevel,
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject missing level', () => {
    const payload = {
      message: 'Test message',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should accept null metadata', () => {
    const payload = {
      level: 'debug' as LogLevel,
      message: 'Debug message',
      metadata: null,
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata).toBeNull();
    }
  });

  it('should accept empty object metadata', () => {
    const payload = {
      level: 'warn' as LogLevel,
      message: 'Warning message',
      metadata: {},
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata).toEqual({});
    }
  });

  it('should accept complex nested metadata', () => {
    const payload = {
      level: 'fatal' as LogLevel,
      message: 'Fatal error',
      metadata: {
        error: {
          code: 500,
          details: ['detail1', 'detail2'],
          nested: {
            deep: {
              value: true,
            },
          },
        },
        timestamp: '2024-01-01',
      },
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata).toEqual(payload.metadata);
    }
  });

  it('should reject negative line_number', () => {
    const payload = {
      level: 'info' as LogLevel,
      message: 'Test message',
      line_number: -1,
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should accept valid ISO timestamp', () => {
    const payload = {
      level: 'info' as LogLevel,
      message: 'Test message',
      timestamp: '2024-01-01T12:00:00.000Z',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timestamp).toBeInstanceOf(Date);
      expect(result.data.timestamp?.toISOString()).toBe('2024-01-01T12:00:00.000Z');
    }
  });

  it('should reject invalid timestamp format', () => {
    const payload = {
      level: 'info' as LogLevel,
      message: 'Test message',
      timestamp: 'invalid-date',
    };

    const result = logPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe('batchLogPayloadSchema', () => {
  it('should accept valid batch with 1 log', () => {
    const payload = {
      logs: [
        {
          level: 'info' as LogLevel,
          message: 'Log 1',
        },
      ],
    };

    const result = batchLogPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.logs).toHaveLength(1);
    }
  });

  it('should accept valid batch with 100 logs', () => {
    const payload = {
      logs: Array.from({ length: 100 }, (_, i) => ({
        level: 'info' as LogLevel,
        message: `Log ${i + 1}`,
      })),
    };

    const result = batchLogPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.logs).toHaveLength(100);
    }
  });

  it('should reject batch with more than 100 logs', () => {
    const payload = {
      logs: Array.from({ length: 101 }, (_, i) => ({
        level: 'info' as LogLevel,
        message: `Log ${i + 1}`,
      })),
    };

    const result = batchLogPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject empty batch', () => {
    const payload = {
      logs: [],
    };

    const result = batchLogPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject batch with invalid log entries', () => {
    const payload = {
      logs: [
        {
          level: 'info' as LogLevel,
          message: 'Valid log',
        },
        {
          level: 'invalid',
          message: 'Invalid log',
        },
      ],
    };

    const result = batchLogPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
