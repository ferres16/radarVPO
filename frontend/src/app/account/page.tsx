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

export default function AccountPage() {
  const { me, loading, setMe } = useProAccess();
  const [courses, setCourses] = useState<UserCourseProgress[]>([]);
  const [coursesError, setCoursesError] = useState('');

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
        <ProStatusCard profile={me} onProfileUpdate={handleProfileUpdate} />
        <MyCoursesSection courses={courses} error={coursesError} />
        <PersonalInfoSection profile={me} onProfileUpdate={handleProfileUpdate} />
        <AccountManagementSection />
      </div>
    </main>
  );
}
