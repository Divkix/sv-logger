import { error } from '@sveltejs/kit';
import { count, eq, min } from 'drizzle-orm';
import { RETENTION_CONFIG } from '$lib/server/config';
import { log, project } from '$lib/server/db/schema';
import { requireAuth } from '$lib/server/utils/auth-guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // Require session authentication
  await requireAuth(event);

  const { db } = await import('$lib/server/db');
  const projectId = event.params.id;

  // Fetch project data
  const [projectData] = await db.select().from(project).where(eq(project.id, projectId));

  if (!projectData) {
    throw error(404, { message: 'Project not found' });
  }

  // Get log stats: total count and oldest log date
  const [logStats] = await db
    .select({
      totalLogs: count(),
      oldestLog: min(log.timestamp),
    })
    .from(log)
    .where(eq(log.projectId, projectId));

  return {
    project: {
      id: projectData.id,
      name: projectData.name,
      apiKey: projectData.apiKey,
      retentionDays: projectData.retentionDays,
      createdAt: projectData.createdAt?.toISOString() ?? null,
      updatedAt: projectData.updatedAt?.toISOString() ?? null,
    },
    stats: {
      totalLogs: logStats?.totalLogs ?? 0,
      oldestLogDate: logStats?.oldestLog?.toISOString() ?? null,
    },
    systemDefault: {
      retentionDays: RETENTION_CONFIG.LOG_RETENTION_DAYS,
    },
  };
};
