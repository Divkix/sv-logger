import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as schema from '../../src/lib/server/db/schema';
import { setupTestDatabase } from '../../src/lib/server/db/test-utils';

describe('Database Integration Tests', () => {
  let db: PgliteDatabase<typeof schema>;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    db = setup.db;
    cleanup = setup.cleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should create and query a user', async () => {
    const result = await db.insert(schema.user).values({ age: 25 }).returning();
    expect(result).toHaveLength(1);
    expect(result[0].age).toBe(25);
  });

  it('should handle multiple users', async () => {
    await db.insert(schema.user).values([{ age: 20 }, { age: 30 }, { age: 40 }]);

    const users = await db.select().from(schema.user);
    expect(users).toHaveLength(3);
  });
});
