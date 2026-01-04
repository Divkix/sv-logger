import { LogwellError } from './errors';
import type { IngestResponse, LogEntry } from './types';

/**
 * Callback type for sending batched logs
 */
export type SendBatchFn = (logs: LogEntry[]) => Promise<IngestResponse>;

/**
 * Queue configuration options
 */
export interface QueueConfig {
  batchSize: number;
  flushInterval: number;
  maxQueueSize: number;
  onError?: (error: Error) => void;
  onFlush?: (count: number) => void;
}

/**
 * Batch queue for buffering and sending logs
 *
 * Features:
 * - Automatic flush on batch size threshold
 * - Automatic flush on time interval
 * - Queue overflow protection (drops oldest)
 * - Re-queue on send failure
 * - Graceful shutdown
 */
export class BatchQueue {
  private queue: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;
  private stopped = false;

  constructor(
    private sendBatch: SendBatchFn,
    private config: QueueConfig,
  ) {}

  /**
   * Current number of logs in the queue
   */
  get size(): number {
    return this.queue.length;
  }

  /**
   * Add a log entry to the queue
   *
   * Triggers flush if batch size is reached.
   * Drops oldest log if queue overflows.
   */
  add(entry: LogEntry): void {
    if (this.stopped) {
      return;
    }

    // Handle queue overflow
    if (this.queue.length >= this.config.maxQueueSize) {
      const dropped = this.queue.shift();
      this.config.onError?.(
        new LogwellError(
          `Queue overflow. Dropped log: ${dropped?.message.substring(0, 50)}...`,
          'QUEUE_OVERFLOW',
        ),
      );
    }

    this.queue.push(entry);

    // Start timer on first entry
    if (!this.flushTimer && !this.stopped) {
      this.startTimer();
    }

    // Flush immediately if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      void this.flush();
    }
  }

  /**
   * Flush all queued logs immediately
   *
   * @returns Response from the server, or null if queue was empty
   */
  async flush(): Promise<IngestResponse | null> {
    // Prevent concurrent flushes
    if (this.flushing || this.queue.length === 0) {
      return null;
    }

    this.flushing = true;
    this.stopTimer();

    // Take current batch
    const batch = this.queue.splice(0);
    const count = batch.length;

    try {
      const response = await this.sendBatch(batch);
      this.config.onFlush?.(count);

      // Restart timer if more logs remain (added during flush)
      if (this.queue.length > 0 && !this.stopped) {
        this.startTimer();
      }

      return response;
    } catch (error) {
      // Re-queue failed logs at the front
      this.queue.unshift(...batch);
      this.config.onError?.(error as Error);

      // Restart timer to retry
      if (!this.stopped) {
        this.startTimer();
      }

      return null;
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Flush remaining logs and stop the queue
   */
  async shutdown(): Promise<void> {
    if (this.stopped) {
      return;
    }

    this.stopped = true;
    this.stopTimer();

    // Flush all remaining logs
    if (this.queue.length > 0) {
      this.flushing = false; // Reset flushing flag
      await this.flush();
    }
  }

  private startTimer(): void {
    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, this.config.flushInterval);
  }

  private stopTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
