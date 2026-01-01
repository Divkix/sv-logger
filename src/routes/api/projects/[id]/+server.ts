import { json } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '$lib/server/db/schema';
import { log, project } from '$lib/server/db/schema';
import { invalidateApiKeyCache } from '$lib/server/utils/api-key';
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
 * GET /api/projects/[id]
 *
 * Returns a single project with its stats including log count and level distribution.
 * Requires session authentication.
 *
 * Response:
 * {
 *   id: string,
 *   name: string,
 *   apiKey: string,
 *   createdAt: string,
 *   updatedAt: string,
 *   stats: {
 *     totalLogs: number,
 *     levelCounts: {
 *       debug?: number,
 *       info?: number,
 *       warn?: number,
 *       error?: number,
 *       fatal?: number
 *     }
 *   }
 * }
 *
 * Error responses:
 * - 404 not_found: Project does not exist
 */
export async function GET(event: RequestEvent): Promise<Response> {
  // Require session authentication
  await requireAuth(event);

  const db = await getDbClient(event.locals);
  const projectId = event.params.id;

  // Fetch project
  const [projectData] = await db.select().from(project).where(eq(project.id, projectId));

  if (!projectData) {
    return json({ error: 'not_found', message: 'Project not found' }, { status: 404 });
  }

  // Get total log count
  const [logCountResult] = await db
    .select({ count: count() })
    .from(log)
    .where(eq(log.projectId, projectId));

  // Get level distribution
  const levelCounts = await db
    .select({
      level: log.level,
      count: count(),
    })
    .from(log)
    .where(eq(log.projectId, projectId))
    .groupBy(log.level);

  // Convert level counts to object
  const levelCountsObj: Record<string, number> = {};
  for (const { level, count: levelCount } of levelCounts) {
    if (level) {
      levelCountsObj[level] = levelCount;
    }
  }

  return json({
    id: projectData.id,
    name: projectData.name,
    apiKey: projectData.apiKey,
    createdAt: projectData.createdAt?.toISOString(),
    updatedAt: projectData.updatedAt?.toISOString(),
    stats: {
      totalLogs: logCountResult?.count ?? 0,
      levelCounts: levelCountsObj,
    },
  });
}

/**
 * DELETE /api/projects/[id]
 *
 * Deletes a project and all associated logs (via cascade).
 * Also invalidates the project's API key from cache.
 * Requires session authentication.
 *
 * Response:
 * {
 *   success: true,
 *   id: string  // deleted project id
 * }
 *
 * Error responses:
 * - 404 not_found: Project does not exist
 */
export async function DELETE(event: RequestEvent): Promise<Response> {
  // Require session authentication
  await requireAuth(event);

  const db = await getDbClient(event.locals);
  const projectId = event.params.id;

  // Fetch project to get API key for cache invalidation
  const [projectData] = await db
    .select({ id: project.id, apiKey: project.apiKey })
    .from(project)
    .where(eq(project.id, projectId));

  if (!projectData) {
    return json({ error: 'not_found', message: 'Project not found' }, { status: 404 });
  }

  // Delete project (logs will cascade delete via FK constraint)
  await db.delete(project).where(eq(project.id, projectId));

  // Invalidate API key cache
  invalidateApiKeyCache(projectData.apiKey);

  return json({
    success: true,
    id: projectId,
  });
}
