import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

/**
 * Creates an in-memory PGlite database for testing
 */
export async function createTestDatabase(): Promise<PgliteDatabase<typeof schema>> {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  // Create tables directly from schema (no migrations needed for tests)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" SERIAL PRIMARY KEY,
      "age" INTEGER
    );
  `);

  return db;
}

/**
 * Cleans all tables in the test database
 */
export async function cleanDatabase(db: PgliteDatabase<typeof schema>): Promise<void> {
  // Truncate the user table
  try {
    await db.execute(sql`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);
  } catch (error) {
    // Table might not exist, ignore
    console.warn('Could not truncate table user:', error);
  }
}

/**
 * Creates a fresh test database for each test
 */
export async function setupTestDatabase(): Promise<{
  db: PgliteDatabase<typeof schema>;
  cleanup: () => Promise<void>;
}> {
  const db = await createTestDatabase();

  return {
    db,
    cleanup: async () => {
      await cleanDatabase(db);
    },
  };
}

/**
 * Helper to seed test data
 */
export async function seedTestData(
  db: PgliteDatabase<typeof schema>,
  data: {
    users?: Array<{ age: number }>;
  },
): Promise<void> {
  if (data.users) {
    await db.insert(schema.user).values(data.users);
  }
}
