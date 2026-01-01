import { json } from '@sveltejs/kit';
import { and, count, eq, gte, lte, type SQL } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '$lib/server/db/schema';
import { log, project } from '$lib/server/db/schema';
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
 * GET /api/projects/[id]/stats
 *
 * Returns log statistics for a project including level distribution counts and percentages.
 * Requires session authentication.
 *
 * Query Parameters:
 * - from: string (ISO 8601) - Start timestamp filter
 * - to: string (ISO 8601) - End timestamp filter
 *
 * Response:
 * {
 *   totalLogs: number,
 *   levelCounts: {
 *     debug?: number,
 *     info?: number,
 *     warn?: number,
 *     error?: number,
 *     fatal?: number
 *   },
 *   levelPercentages: {
 *     debug?: number,
 *     info?: number,
 *     warn?: number,
 *     error?: number,
 *     fatal?: number
 *   }
 * }
 *
 * Error responses:
 * - 303 redirect to /login: Not authenticated
 * - 404 not_found: Project does not exist
 */
export async function GET(event: RequestEvent): Promise<Response> {
  // Require session authentication
  await requireAuth(event);

  const db = await getDbClient(event.locals);
  const projectId = event.params.id;

  // Verify project exists
  const [projectData] = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.id, projectId));

  if (!projectData) {
    return json({ error: 'not_found', message: 'Project not found' }, { status: 404 });
  }

  // Parse query parameters for time range
  const url = event.url;
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');

  // Parse time range
  const fromDate = fromParam ? new Date(fromParam) : null;
  const toDate = toParam ? new Date(toParam) : null;

  // Build WHERE conditions
  const conditions: SQL[] = [eq(log.projectId, projectId)];

  // Time range filters
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    conditions.push(gte(log.timestamp, fromDate));
  }
  if (toDate && !Number.isNaN(toDate.getTime())) {
    conditions.push(lte(log.timestamp, toDate));
  }

  const whereClause = and(...conditions);

  // Get level distribution counts
  const levelCounts = await db
    .select({
      level: log.level,
      count: count(),
    })
    .from(log)
    .where(whereClause)
    .groupBy(log.level);

  // Convert level counts to object and calculate total
  const levelCountsObj: Record<string, number> = {};
  let totalLogs = 0;

  for (const { level, count: levelCount } of levelCounts) {
    if (level) {
      levelCountsObj[level] = levelCount;
      totalLogs += levelCount;
    }
  }

  // Calculate percentages
  const levelPercentagesObj: Record<string, number> = {};

  if (totalLogs > 0) {
    for (const [level, levelCount] of Object.entries(levelCountsObj)) {
      levelPercentagesObj[level] = Number(((levelCount / totalLogs) * 100).toFixed(2));
    }
  }

  return json({
    totalLogs,
    levelCounts: levelCountsObj,
    levelPercentages: levelPercentagesObj,
  });
}
