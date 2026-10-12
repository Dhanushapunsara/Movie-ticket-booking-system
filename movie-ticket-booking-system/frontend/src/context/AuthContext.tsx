import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/services';
import type { SignInRequest, SignUpRequest, User } from '../types';
import { tokenStorage } from '../utils/tokenStorage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  signIn: (body: SignInRequest) => Promise<User>;
  signUp: (body: SignUpRequest) => Promise<User>;
  signOut: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => tokenStorage.load()?.user ?? null);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUserState(null);
  }, []);

  // The Axios interceptor fires this when the backend rejects the token (expired / invalid).
  useEffect(() => {
    const onExpired = () => setUserState(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  // Log out automatically when the token's expiry time is reached.
  useEffect(() => {
    const session = tokenStorage.load();
    if (!session) return;
    const ms = new Date(session.expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(signOut, Math.max(ms, 0));
    return () => window.clearTimeout(timer);
  }, [user, signOut]);

  const signIn = useCallback(async (body: SignInRequest) => {
    const res = await authApi.signIn(body);
    tokenStorage.save({ token: res.token, expiresAt: res.expiresAt, user: res.user });
    setUserState(res.user);
    return res.user;
  }, []);

  const signUp = useCallback(async (body: SignUpRequest) => {
    const res = await authApi.signUp(body);
    tokenStorage.save({ token: res.token, expiresAt: res.expiresAt, user: res.user });
    setUserState(res.user);
    return res.user;
  }, []);

  const setUser = useCallback((u: User) => {
    tokenStorage.updateUser(u);
    setUserState(u);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
    signIn,
    signUp,
    signOut,
    setUser,
  }), [user, signIn, signUp, signOut, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
