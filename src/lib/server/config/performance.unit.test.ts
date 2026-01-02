import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Performance Configuration', () => {
  // Store original env
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset module cache to allow re-importing with new env
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('SSE Batching Configuration', () => {
    it('exports BATCH_WINDOW_MS with default value of 1500', async () => {
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.BATCH_WINDOW_MS).toBe(1500);
    });

    it('exports MAX_BATCH_SIZE with default value of 50', async () => {
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.MAX_BATCH_SIZE).toBe(50);
    });

    it('exports HEARTBEAT_INTERVAL_MS with default value of 30000', async () => {
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.HEARTBEAT_INTERVAL_MS).toBe(30000);
    });

    it('respects SSE_BATCH_WINDOW_MS environment variable', async () => {
      process.env.SSE_BATCH_WINDOW_MS = '2000';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.BATCH_WINDOW_MS).toBe(2000);
    });

    it('respects SSE_MAX_BATCH_SIZE environment variable', async () => {
      process.env.SSE_MAX_BATCH_SIZE = '100';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.MAX_BATCH_SIZE).toBe(100);
    });

    it('respects SSE_HEARTBEAT_INTERVAL_MS environment variable', async () => {
      process.env.SSE_HEARTBEAT_INTERVAL_MS = '60000';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.HEARTBEAT_INTERVAL_MS).toBe(60000);
    });

    it('clamps BATCH_WINDOW_MS to minimum of 100ms', async () => {
      process.env.SSE_BATCH_WINDOW_MS = '50';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.BATCH_WINDOW_MS).toBe(100);
    });

    it('clamps MAX_BATCH_SIZE to minimum of 1', async () => {
      process.env.SSE_MAX_BATCH_SIZE = '0';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.MAX_BATCH_SIZE).toBe(1);
    });

    it('clamps HEARTBEAT_INTERVAL_MS to minimum of 5000ms', async () => {
      process.env.SSE_HEARTBEAT_INTERVAL_MS = '1000';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.HEARTBEAT_INTERVAL_MS).toBe(5000);
    });

    it('ignores invalid (non-numeric) environment values', async () => {
      process.env.SSE_BATCH_WINDOW_MS = 'invalid';
      const { SSE_CONFIG } = await import('./performance');
      expect(SSE_CONFIG.BATCH_WINDOW_MS).toBe(1500);
    });
  });

  describe('Log Stream Configuration', () => {
    it('exports DEFAULT_MAX_LOGS with value of 1000', async () => {
      const { LOG_STREAM_CONFIG } = await import('./performance');
      expect(LOG_STREAM_CONFIG.DEFAULT_MAX_LOGS).toBe(1000);
    });

    it('exports MAX_LOGS_UPPER_LIMIT with value of 10000', async () => {
      const { LOG_STREAM_CONFIG } = await import('./performance');
      expect(LOG_STREAM_CONFIG.MAX_LOGS_UPPER_LIMIT).toBe(10000);
    });

    it('respects LOG_STREAM_MAX_LOGS environment variable', async () => {
      process.env.LOG_STREAM_MAX_LOGS = '5000';
      const { LOG_STREAM_CONFIG } = await import('./performance');
      expect(LOG_STREAM_CONFIG.DEFAULT_MAX_LOGS).toBe(5000);
    });

    it('clamps DEFAULT_MAX_LOGS to MAX_LOGS_UPPER_LIMIT', async () => {
      process.env.LOG_STREAM_MAX_LOGS = '20000';
      const { LOG_STREAM_CONFIG } = await import('./performance');
      expect(LOG_STREAM_CONFIG.DEFAULT_MAX_LOGS).toBe(10000);
    });
  });

  describe('API Rate Limiting Configuration', () => {
    it('exports BATCH_INSERT_LIMIT with default value of 100', async () => {
      const { API_CONFIG } = await import('./performance');
      expect(API_CONFIG.BATCH_INSERT_LIMIT).toBe(100);
    });

    it('exports DEFAULT_PAGE_SIZE with value of 100', async () => {
      const { API_CONFIG } = await import('./performance');
      expect(API_CONFIG.DEFAULT_PAGE_SIZE).toBe(100);
    });

    it('exports MAX_PAGE_SIZE with value of 500', async () => {
      const { API_CONFIG } = await import('./performance');
      expect(API_CONFIG.MAX_PAGE_SIZE).toBe(500);
    });
  });

  describe('Configuration Validation', () => {
    it('validateSSEConfig returns true for valid config', async () => {
      const { validateSSEConfig, SSE_CONFIG } = await import('./performance');
      expect(validateSSEConfig(SSE_CONFIG)).toBe(true);
    });

    it('validateSSEConfig returns false for invalid batch window', async () => {
      const { validateSSEConfig } = await import('./performance');
      const invalidConfig = {
        BATCH_WINDOW_MS: -1,
        MAX_BATCH_SIZE: 50,
        HEARTBEAT_INTERVAL_MS: 30000,
      };
      expect(validateSSEConfig(invalidConfig)).toBe(false);
    });

    it('validateSSEConfig returns false for invalid batch size', async () => {
      const { validateSSEConfig } = await import('./performance');
      const invalidConfig = {
        BATCH_WINDOW_MS: 1500,
        MAX_BATCH_SIZE: 0,
        HEARTBEAT_INTERVAL_MS: 30000,
      };
      expect(validateSSEConfig(invalidConfig)).toBe(false);
    });
  });
});
