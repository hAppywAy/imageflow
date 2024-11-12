export const getSessionStorageKey = (sessionId: string) =>
  `session:${sessionId}`;

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
