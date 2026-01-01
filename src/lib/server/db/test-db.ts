import { PGlite } from '@electric-sql/pglite';
import { is, sql } from 'drizzle-orm';
import { getTableConfig, PgTable } from 'drizzle-orm/pg-core';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

/**
 * Generates CREATE TABLE SQL from Drizzle schema table definition
 * This is a simplified version - for complex schemas, consider using drizzle-kit
 */
function generateCreateTableSQL(table: PgTable): string {
  const config = getTableConfig(table);
  const tableName = config.name;
  const columns: string[] = [];

  // Process columns
  for (const column of config.columns) {
    const parts: string[] = [`"${column.name}"`];

    // Add data type
    if (column.dataType === 'number') {
      if (column.columnType === 'PgSerial') {
        parts.push('SERIAL');
      } else {
        parts.push('INTEGER');
      }
    } else if (column.dataType === 'string') {
      if (column.columnType.includes('Text')) {
        parts.push('TEXT');
      } else if (column.columnType.includes('Varchar')) {
        // Extract length if available
        parts.push('VARCHAR(255)');
      } else {
        parts.push('TEXT');
      }
    } else if (column.dataType === 'boolean') {
      parts.push('BOOLEAN');
    } else if (column.dataType === 'date') {
      parts.push('TIMESTAMP');
    } else if (column.dataType === 'json') {
      parts.push('JSONB');
    } else {
      // Default fallback
      parts.push('TEXT');
    }

    // Add constraints
    if (column.notNull) {
      parts.push('NOT NULL');
    }

    if (column.primary) {
      parts.push('PRIMARY KEY');
    }

    if (column.default !== undefined) {
      parts.push(`DEFAULT ${column.default}`);
    }

    columns.push(parts.join(' '));
  }

  return `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns.join(', ')})`;
}

/**
 * Creates an in-memory PGlite database for testing with dynamic schema application
 */
export async function createTestDatabase(): Promise<PgliteDatabase<typeof schema>> {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  // Dynamically create all tables from schema
  const tables = Object.values(schema).filter((item) => is(item, PgTable));

  for (const table of tables) {
    const createSQL = generateCreateTableSQL(table as PgTable);
    await db.execute(sql.raw(createSQL));
  }

  return db;
}

/**
 * Cleans all tables in the test database by truncating them dynamically
 */
export async function cleanDatabase(db: PgliteDatabase<typeof schema>): Promise<void> {
  // Get all table names from schema
  const tables = Object.values(schema).filter((item) => is(item, PgTable));

  // Truncate all tables
  for (const table of tables) {
    const config = getTableConfig(table as PgTable);
    const tableName = config.name;

    try {
      await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`));
    } catch (error) {
      // Table might not exist or other error, log but continue
      console.warn(`Could not truncate table ${tableName}:`, error);
    }
  }
}

/**
 * Creates a fresh test database for each test with cleanup function
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
