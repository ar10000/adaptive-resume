// Simple authentication utilities
// For production, use a proper auth service like NextAuth.js, Clerk, or Auth0

export interface User {
  id: string;
  email: string;
  name?: string;
}

// In-memory session storage (use database in production)
const sessions = new Map<string, { user: User; expiresAt: number }>();

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a session for a user
 */
export function createSession(user: User): string {
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_DURATION;

  sessions.set(sessionId, { user, expiresAt });

  // Clean up expired sessions
  cleanupExpiredSessions();

  return sessionId;
}

/**
 * Get user from session
 */
export function getUserFromSession(sessionId: string): User | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session.user;
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

/**
 * Verify API key (for optional API authentication)
 */
export function verifyApiKey(apiKey: string): boolean {
  // In production, verify against database
  // For now, this is a placeholder
  return apiKey === process.env.API_KEY;
}

