import type { User } from '../types';

const KEY = 'cinebook.session';

export interface StoredSession {
  token: string;
  expiresAt: string;
  user: User;
}

/**
 * Keeps the JWT session in localStorage so it survives page reloads.
 * Expired sessions are discarded on read, and the backend re-validates every token anyway.
 * (For production, an httpOnly cookie set by the server is safer against XSS.)
 */
export const tokenStorage = {
  load(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as StoredSession;
      if (!session.token || new Date(session.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  save(session: StoredSession) {
    try {
      localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable (private mode) - session lives in memory only */
    }
  },

  updateUser(user: User) {
    const current = this.load();
    if (current) this.save({ ...current, user });
  },

  getToken(): string | null {
    return this.load()?.token ?? null;
  },

  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
