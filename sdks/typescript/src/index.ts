/**
 * Logwell SDK - Official TypeScript SDK for Logwell logging platform
 *
 * @packageDocumentation
 */

// Main client
export { Logwell, type ChildLoggerOptions } from './client';

// Types
export type {
  LogLevel,
  LogEntry,
  LogwellConfig,
  IngestResponse,
} from './types';

// Errors
export { LogwellError, type LogwellErrorCode } from './errors';
