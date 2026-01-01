import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$lib/server/auth';
import { getSession } from '$lib/server/session';

/**
 * Authentication hook - populates event.locals with user and session
 */
const authenticationHandle: Handle = async ({ event, resolve }) => {
  // Get session from database
  const sessionData = await getSession(event.request.headers);

  // Populate event.locals with user and session
  if (sessionData) {
    event.locals.user = sessionData.user;
    event.locals.session = sessionData.session;
  }

  return resolve(event);
};

/**
 * Better-auth API handler for /api/auth/* routes
 */
const authHandler: Handle = async ({ event, resolve }) => {
  // Let better-auth handle its own routes
  if (event.url.pathname.startsWith('/api/auth')) {
    return auth.handler(event.request);
  }

  return resolve(event);
};

/**
 * Combined hooks sequence: auth handler first, then authentication
 */
export const handle = sequence(authHandler, authenticationHandle);
