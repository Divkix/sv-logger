import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from '../../src/lib/server/db/schema';

/**
 * Type for user creation
 */
export type UserInsert = typeof schema.user.$inferInsert;
export type UserSelect = typeof schema.user.$inferSelect;

/**
 * Factory function to create test users
 */
export function createUserFactory(overrides: Partial<UserInsert> = {}): UserInsert {
  return {
    age: 25,
    ...overrides,
  };
}

/**
 * Seed multiple users into the database
 */
export async function seedUsers(
  db: PgliteDatabase<typeof schema>,
  count: number = 3,
  overrides: Partial<UserInsert> = {},
): Promise<UserSelect[]> {
  const users: UserInsert[] = Array.from({ length: count }, (_, i) =>
    createUserFactory({ age: 20 + i * 5, ...overrides }),
  );

  return await db.insert(schema.user).values(users).returning();
}

/**
 * Seed a single user into the database
 */
export async function seedUser(
  db: PgliteDatabase<typeof schema>,
  overrides: Partial<UserInsert> = {},
): Promise<UserSelect> {
  // Use createUserFactory to ensure default values are used
  const user = createUserFactory(overrides);
  const [result] = await db.insert(schema.user).values(user).returning();
  return result;
}

/**
 * Generic seeder for any table
 */
export async function seedTestData(
  db: PgliteDatabase<typeof schema>,
  data: {
    users?: UserInsert[];
  },
): Promise<void> {
  if (data.users && data.users.length > 0) {
    await db.insert(schema.user).values(data.users);
  }
}

/**
 * Create multiple users with specific ages
 */
export async function seedUsersWithAges(
  db: PgliteDatabase<typeof schema>,
  ages: number[],
): Promise<UserSelect[]> {
  // Handle empty array
  if (ages.length === 0) {
    return [];
  }

  const users = ages.map((age) => createUserFactory({ age }));
  return await db.insert(schema.user).values(users).returning();
}
