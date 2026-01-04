/**
 * Error codes for Logwell SDK errors
 */
export type LogwellErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'QUEUE_OVERFLOW'
  | 'INVALID_CONFIG';

/**
 * Custom error class for Logwell SDK errors
 *
 * @example
 * ```ts
 * throw new LogwellError('Invalid API key', 'UNAUTHORIZED', 401, false);
 * ```
 */
// V8 specific type for captureStackTrace
declare global {
  interface ErrorConstructor {
    captureStackTrace?(targetObject: object, constructorOpt?: NewableFunction): void;
  }
}

export class LogwellError extends Error {
  /**
   * Creates a new LogwellError
   *
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling
   * @param statusCode - HTTP status code if applicable
   * @param retryable - Whether the operation can be retried
   */
  constructor(
    message: string,
    public readonly code: LogwellErrorCode,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'LogwellError';

    // Maintains proper stack trace for where our error was thrown (V8 only)
    Error.captureStackTrace?.(this, LogwellError);
  }
}
