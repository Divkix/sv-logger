/**
 * Cursor utilities for pagination
 *
 * Implements cursor-based pagination using base64url-encoded timestamps and IDs.
 * Provides stable pagination even when new items are added.
 */

/**
 * Encodes a cursor from timestamp and ID
 * Format: base64url(timestamp_id)
 *
 * @param timestamp - The log timestamp
 * @param id - The log ID
 * @returns Base64url-encoded cursor string
 */
export function encodeCursor(timestamp: Date, id: string): string {
  return Buffer.from(`${timestamp.toISOString()}_${id}`).toString('base64url');
}

/**
 * Decodes a cursor back to timestamp and ID
 *
 * @param cursor - Base64url-encoded cursor string
 * @returns Decoded timestamp and ID
 * @throws Error if cursor format is invalid
 */
export function decodeCursor(cursor: string): { timestamp: Date; id: string } {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');

    // ISO 8601 timestamps always end with 'Z', so find the 'Z_' pattern
    // This handles IDs that may contain underscores
    const separatorIndex = decoded.indexOf('Z_');

    if (separatorIndex === -1) {
      throw new Error('Invalid cursor format: missing separator');
    }

    // Include the 'Z' in the timestamp
    const timestampStr = decoded.substring(0, separatorIndex + 1);
    const id = decoded.substring(separatorIndex + 2); // Skip 'Z_'

    if (!timestampStr || !id) {
      throw new Error('Invalid cursor format: empty timestamp or id');
    }

    const timestamp = new Date(timestampStr);
    if (Number.isNaN(timestamp.getTime())) {
      throw new Error('Invalid cursor format: invalid timestamp');
    }

    return { timestamp, id };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid cursor')) {
      throw error;
    }
    throw new Error('Invalid cursor');
  }
}
