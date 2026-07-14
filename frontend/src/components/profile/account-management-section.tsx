'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';

export function AccountManagementSection() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await api.logout();
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ProfileCard>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
        Gestión de cuenta
      </p>
      <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">
        Sesión y seguridad
      </h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Cierra tu sesión en este dispositivo cuando termines.
      </p>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={loggingOut}
        className="btn btn--secondary mt-4 !border-red-100 !text-red-700"
      >
        {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
    </ProfileCard>
  );
}
