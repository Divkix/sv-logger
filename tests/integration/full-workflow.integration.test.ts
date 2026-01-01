import { and, eq, gt, gte, lt, lte } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as schema from '../../src/lib/server/db/schema';
import { setupTestDatabase } from '../../src/lib/server/db/test-db';
import {
  createUserFactory,
  seedUser,
  seedUsers,
  seedUsersWithAges,
} from '../fixtures/db';

/**
 * Full Workflow Integration Test
 *
 * This test demonstrates the complete testing workflow:
 * 1. Setup test database with PGlite
 * 2. Use fixtures to seed data
 * 3. Perform CRUD operations
 * 4. Clean up between tests
 */
describe('Full Workflow - Integration Test', () => {
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

  describe('Complete User Management Workflow', () => {
    it('should demonstrate full CRUD workflow with fixtures', async () => {
      // 1. CREATE - Seed initial data
      const initialUsers = await seedUsersWithAges(db, [20, 30, 40]);
      expect(initialUsers).toHaveLength(3);

      // 2. READ - Query all users
      const allUsers = await db.select().from(schema.user);
      expect(allUsers).toHaveLength(3);
      expect(allUsers.map((u) => u.age)).toEqual([20, 30, 40]);

      // 3. CREATE - Add a new user using factory
      const newUserData = createUserFactory({ age: 50 });
      const [newUser] = await db
        .insert(schema.user)
        .values(newUserData)
        .returning();
      expect(newUser.age).toBe(50);

      // 4. READ - Query specific user
      const [foundUser] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, newUser.id));
      expect(foundUser).toEqual(newUser);

      // 5. UPDATE - Modify user age
      const [updatedUser] = await db
        .update(schema.user)
        .set({ age: 55 })
        .where(eq(schema.user.id, newUser.id))
        .returning();
      expect(updatedUser.age).toBe(55);

      // 6. READ - Verify update
      const afterUpdate = await db.select().from(schema.user);
      expect(afterUpdate).toHaveLength(4);
      expect(afterUpdate.find((u) => u.id === newUser.id)?.age).toBe(55);

      // 7. DELETE - Remove a user
      await db.delete(schema.user).where(eq(schema.user.id, initialUsers[0].id));

      // 8. READ - Verify deletion
      const afterDelete = await db.select().from(schema.user);
      expect(afterDelete).toHaveLength(3);
      expect(afterDelete.find((u) => u.id === initialUsers[0].id)).toBeUndefined();
    });

    it('should handle complex queries with fixtures', async () => {
      // Seed diverse data
      await seedUsersWithAges(db, [18, 25, 30, 35, 40, 45, 50, 55, 60]);

      // Query users under 30
      const youngUsers = await db
        .select()
        .from(schema.user)
        .where(lt(schema.user.age, 30));
      expect(youngUsers).toHaveLength(2);
      expect(youngUsers.every((u) => u.age < 30)).toBe(true);

      // Query users between 30 and 50
      const middleAgedUsers = await db
        .select()
        .from(schema.user)
        .where(and(gte(schema.user.age, 30), lte(schema.user.age, 50)));
      expect(middleAgedUsers).toHaveLength(5);

      // Query users over 50
      const seniorUsers = await db
        .select()
        .from(schema.user)
        .where(gt(schema.user.age, 50));
      expect(seniorUsers).toHaveLength(2);
    });

    it('should support batch operations', async () => {
      // Batch insert using factory
      const batchData = Array.from({ length: 10 }, (_, i) =>
        createUserFactory({ age: 20 + i }),
      );
      await db.insert(schema.user).values(batchData);

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(10);

      // Batch update (age += 10 for all users)
      for (const user of users) {
        await db
          .update(schema.user)
          .set({ age: user.age + 10 })
          .where(eq(schema.user.id, user.id));
      }

      const updatedUsers = await db.select().from(schema.user);
      expect(updatedUsers.every((u) => u.age >= 30)).toBe(true);

      // Batch delete (remove users over 35)
      for (const user of updatedUsers) {
        if (user.age > 35) {
          await db.delete(schema.user).where(eq(schema.user.id, user.id));
        }
      }

      const remainingUsers = await db.select().from(schema.user);
      expect(remainingUsers.every((u) => u.age <= 35)).toBe(true);
    });

    it('should maintain isolation between test runs', async () => {
      // This test verifies that cleanup works properly
      // Database should be empty at start
      const beforeSeed = await db.select().from(schema.user);
      expect(beforeSeed).toHaveLength(0);

      // Seed some data
      await seedUsers(db, 5);
      const afterSeed = await db.select().from(schema.user);
      expect(afterSeed).toHaveLength(5);

      // The afterEach hook will clean this data
      // Next test should start fresh
    });

    it('should verify cleanup happened from previous test', async () => {
      // This test runs after the previous one
      // It should have a clean database
      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(0);
    });
  });

  describe('Transaction Workflow', () => {
    it('should support complex transactions with rollback', async () => {
      // Initial state
      await seedUser(db, { age: 25 });
      const beforeTransaction = await db.select().from(schema.user);
      expect(beforeTransaction).toHaveLength(1);

      // Failed transaction should rollback
      try {
        await db.transaction(async (tx) => {
          // Add users in transaction
          await tx.insert(schema.user).values({ age: 30 });
          await tx.insert(schema.user).values({ age: 35 });

          // Simulate error
          throw new Error('Rollback this transaction');
        });
      } catch (error) {
        // Expected error
        expect((error as Error).message).toBe('Rollback this transaction');
      }

      // Transaction should have rolled back
      const afterFailedTransaction = await db.select().from(schema.user);
      expect(afterFailedTransaction).toHaveLength(1);
      expect(afterFailedTransaction[0].age).toBe(25);
    });

    it('should commit successful transactions', async () => {
      const result = await db.transaction(async (tx) => {
        await tx.insert(schema.user).values({ age: 20 });
        await tx.insert(schema.user).values({ age: 30 });
        await tx.insert(schema.user).values({ age: 40 });
        return 'success';
      });

      expect(result).toBe('success');

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(3);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle user registration and profile update flow', async () => {
      // Step 1: User registers (age 25)
      const registrationData = createUserFactory({ age: 25 });
      const [registeredUser] = await db
        .insert(schema.user)
        .values(registrationData)
        .returning();

      expect(registeredUser).toMatchObject({
        id: expect.any(Number),
        age: 25,
      });

      // Step 2: User updates profile
      const [updatedProfile] = await db
        .update(schema.user)
        .set({ age: 26 })
        .where(eq(schema.user.id, registeredUser.id))
        .returning();

      expect(updatedProfile.age).toBe(26);

      // Step 3: Fetch user profile
      const [profile] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, registeredUser.id));

      expect(profile).toEqual(updatedProfile);
    });

    it('should handle bulk user import scenario', async () => {
      // Simulate importing users from CSV/API
      const importedData = [
        { age: 22 },
        { age: 28 },
        { age: 35 },
        { age: 42 },
        { age: 55 },
      ];

      // Import users
      await db.insert(schema.user).values(importedData);

      // Verify import
      const allUsers = await db.select().from(schema.user);
      expect(allUsers).toHaveLength(5);

      // Query for validation (find users under 30)
      const youngUsers = await db
        .select()
        .from(schema.user)
        .where(lt(schema.user.age, 30));
      expect(youngUsers).toHaveLength(2);
    });
  });
});
