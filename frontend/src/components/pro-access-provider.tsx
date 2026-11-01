'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { hasProAccess } from '@/lib/pro-access';
import {
  clearAuthSessionMarkerClient,
  hasAuthSessionMarker,
  markAuthSessionClient,
} from '@/lib/session-marker';
import type { UserProfile } from '@/types';

type ProAccessContextValue = {
  me: UserProfile | null;
  loading: boolean;
  hasPro: boolean;
  refresh: () => Promise<void>;
  setMe: (profile: UserProfile | null) => void;
};

const ProAccessContext = createContext<ProAccessContextValue | null>(null);

export function ProAccessProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const profile = await api.getMe();
      markAuthSessionClient();
      setMe(profile);
    } catch {
      clearAuthSessionMarkerClient();
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      // Visitante anónimo: no dispares /users/me ni /auth/refresh (evita 401+400 en consola).
      if (!hasAuthSessionMarker()) {
        if (active) {
          setMe(null);
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await api.getMe();
        if (!active) return;
        markAuthSessionClient();
        setMe(profile);
      } catch {
        if (!active) return;
        clearAuthSessionMarkerClient();
        setMe(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      me,
      loading,
      hasPro: hasProAccess(me),
      refresh,
      setMe,
    }),
    [me, loading, refresh],
  );

  return (
    <ProAccessContext.Provider value={value}>{children}</ProAccessContext.Provider>
  );
}

export function useProAccess() {
  const context = useContext(ProAccessContext);
  if (!context) {
    throw new Error('useProAccess must be used within ProAccessProvider');
  }
  return context;
}

export function useOptionalProAccess() {
  return useContext(ProAccessContext);
}
