'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useProAccess } from '@/components/pro-access-provider';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProStatusCard } from '@/components/pro/pro-status-card';
import { MyCoursesSection } from '@/components/profile/my-courses-section';
import { PersonalInfoSection } from '@/components/profile/personal-info-section';
import { AccountManagementSection } from '@/components/profile/account-management-section';
import { ProfileCard } from '@/components/profile-card';
import type { UserCourseProgress, UserProfile } from '@/types';

const ACTIVATION_POLL_ATTEMPTS = 8;
const ACTIVATION_POLL_INTERVAL_MS = 2500;

export default function AccountPage() {
  const { me, loading, setMe, refresh } = useProAccess();
  const [courses, setCourses] = useState<UserCourseProgress[]>([]);
  const [coursesError, setCoursesError] = useState('');
  const [justPaidPro, setJustPaidPro] = useState(false);
  const [activationTimedOut, setActivationTimedOut] = useState(false);

  // Tras pagar PRO, Stripe avisa por webhook: esperamos unos segundos a que se active.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success' && params.get('product') === 'pro') {
      setJustPaidPro(true);
    }
  }, []);

  const proActive = Boolean(me?.proAccess?.hasAccess);
  useEffect(() => {
    if (!justPaidPro || proActive || !me) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      void refresh();
      if (attempts >= ACTIVATION_POLL_ATTEMPTS) {
        window.clearInterval(timer);
        setActivationTimedOut(true);
      }
    }, ACTIVATION_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [justPaidPro, proActive, me, refresh]);

  useEffect(() => {
    if (!me) {
      setCourses([]);
      setCoursesError('');
      return;
    }
    let active = true;

    (async () => {
      try {
        const list = await api.getMyCourses();
        if (active) setCourses(list);
      } catch {
        if (active) setCoursesError('No se pudieron cargar tus cursos.');
      }
    })();

    return () => {
      active = false;
    };
  }, [me]);

  function handleProfileUpdate(profile: UserProfile) {
    setMe(profile);
  }

  if (loading) {
    return (
      <main className="lp lp--inner">
        <div className="shell">
          <ProfileCard>
            <p className="text-sm text-[var(--ink-soft)]">Cargando tu perfil...</p>
          </ProfileCard>
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="lp lp--inner">
        <div className="shell">
          <ProfileCard>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Tu perfil</h1>
            <p className="mt-2 text-[var(--ink-soft)]">
              Para ver tus datos necesitas iniciar sesión.
            </p>
            <Link href="/login" className="btn btn--primary btn--block mt-4">
              Iniciar sesión
            </Link>
          </ProfileCard>
        </div>
      </main>
    );
  }

  return (
    <main className="lp lp--inner lp--app space-y-4 md:space-y-6">
      <div className="shell space-y-4 pb-6 md:space-y-6 md:pb-8">
        <ProfileHeader profile={me} />
        {justPaidPro ? (
          <div
            role="status"
            className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            {proActive
              ? 'Pago recibido: Radar VPO PRO ya está activo en tu cuenta.'
              : activationTimedOut
                ? 'Hemos recibido el pago, pero la activación está tardando más de lo normal. Recarga la página en unos minutos; si no se activa, escribe a soporte con el correo de tu cuenta.'
                : 'Pago recibido. Estamos activando Radar VPO PRO…'}
          </div>
        ) : null}
        <ProStatusCard profile={me} onProfileUpdate={handleProfileUpdate} />
        <MyCoursesSection courses={courses} error={coursesError} />
        <PersonalInfoSection profile={me} onProfileUpdate={handleProfileUpdate} />
        <AccountManagementSection />
      </div>
    </main>
  );
}
