#!/usr/bin/env bun
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createAuth } from '../src/lib/server/auth';
import * as schema from '../src/lib/server/db/schema';

// Admin email constant
const ADMIN_EMAIL = 'admin@example.com';

/**
 * Seeds the admin user into the database
 * Uses ADMIN_PASSWORD from environment variable
 */
async function seedAdmin() {
  // Check for required environment variables
  const DATABASE_URL = process.env.DATABASE_URL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
  }

  // Initialize database connection
  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, ADMIN_EMAIL));

    if (existingAdmin.length > 0) {
      console.log('✓ Admin user already exists, skipping');
      return;
    }

    // Create admin user via better-auth
    const auth = createAuth(db);
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Admin',
      },
    });

    if (result.error) {
      throw new Error(`Failed to create admin user: ${result.error.message}`);
    }

    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log('  You can now sign in with the admin credentials');
  } catch (error) {
    console.error('✗ Failed to seed admin user:', error);
    throw error;
  } finally {
    // Close database connection
    await client.end();
  }
}

// Run the seed function
seedAdmin().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
