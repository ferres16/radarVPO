'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';

export function AccountManagementSection() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
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
        Cierra tu sesión en este dispositivo cuando termines o solicita un enlace para cambiar tu contraseña.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link href="/forgot-password" className="btn btn--secondary">
          Cambiar contraseña
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={loggingOut}
          className="btn btn--secondary !border-red-100 !text-red-700"
        >
          {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
    </ProfileCard>
  );
}
