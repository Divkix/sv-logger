import { createAuthClient } from 'better-auth/svelte';

/**
 * Client-side auth helper for better-auth
 * Provides type-safe authentication methods for use in components
 */
export const authClient = createAuthClient({
  baseURL: 'http://localhost:5173',
});

/**
 * Svelte store for current session
 */
export const { useSession } = authClient;
