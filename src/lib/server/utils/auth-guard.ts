import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { Session, User } from '../auth';

/**
 * Result of successful authentication check
 * Returns non-optional user and session types for type safety in protected routes
 */
export interface AuthenticatedSession {
  user: User;
  session: Session;
}

/**
 * Requires authenticated session for protected routes
 *
 * Checks if the request has a valid authenticated session via event.locals.
 * If not authenticated, throws a redirect to /login.
 * If authenticated, returns the user and session with guaranteed non-optional types.
 *
 * @param event - SvelteKit RequestEvent from load function or action
 * @returns Promise resolving to { user, session } with non-optional types
 * @throws Redirect to /login if not authenticated
 *
 * @example
 * // In +page.server.ts or +layout.server.ts
 * export async function load(event) {
 *   const { user, session } = await requireAuth(event);
 *   // user and session are guaranteed to be defined here
 *   return { user };
 * }
 */
export async function requireAuth(event: RequestEvent): Promise<AuthenticatedSession> {
  const { user, session } = event.locals;

  if (!user || !session) {
    throw redirect(303, '/login');
  }

  return { user, session };
}
