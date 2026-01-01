import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '$lib/server/db/schema';
import { project } from '$lib/server/db/schema';
import { generateApiKey, invalidateApiKeyCache } from '$lib/server/utils/api-key';
import { requireAuth } from '$lib/server/utils/auth-guard';
import type { RequestEvent } from './$types';

type DatabaseClient = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

/**
 * Helper to get database client from locals or production db
 * Supports test injection via locals.db
 */
async function getDbClient(locals: App.Locals): Promise<DatabaseClient> {
  if (locals.db) {
    return locals.db as DatabaseClient;
  }
  const { db } = await import('$lib/server/db');
  return db;
}

/**
 * POST /api/projects/[id]/regenerate
 *
 * Regenerates the API key for a project.
 * The old API key is immediately invalidated and a new one is generated.
 * Requires session authentication.
 *
 * Response:
 * {
 *   apiKey: string  // the new API key
 * }
 *
 * Error responses:
 * - 404 not_found: Project does not exist
 */
export async function POST(event: RequestEvent): Promise<Response> {
  // Require session authentication
  await requireAuth(event);

  const db = await getDbClient(event.locals);
  const projectId = event.params.id;

  // Fetch project to get old API key for cache invalidation
  const [projectData] = await db
    .select({ id: project.id, apiKey: project.apiKey })
    .from(project)
    .where(eq(project.id, projectId));

  if (!projectData) {
    return json({ error: 'not_found', message: 'Project not found' }, { status: 404 });
  }

  // Generate new API key
  const newApiKey = generateApiKey();

  // Update project with new API key
  await db
    .update(project)
    .set({
      apiKey: newApiKey,
      updatedAt: new Date(),
    })
    .where(eq(project.id, projectId));

  // Invalidate old API key cache
  invalidateApiKeyCache(projectData.apiKey);

  return json({
    apiKey: newApiKey,
  });
}
