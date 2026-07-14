'use client';

import { useMemo } from 'react';
import { ProfileCard } from '@/components/profile-card';
import { splitFullName } from '@/lib/pro-access';
import type { UserProfile } from '@/types';

type ProfileHeaderProps = {
  profile: UserProfile;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const display = useMemo(() => {
    const { firstName, lastName } = splitFullName(profile.fullName);
    const fallback = profile.email.split('@')[0] || 'Usuario';
    return {
      firstName: firstName || fallback,
      lastName,
      initials: (firstName || fallback).slice(0, 1).toUpperCase() +
        (lastName ? lastName.slice(0, 1).toUpperCase() : profile.email.slice(1, 2).toUpperCase()),
    };
  }, [profile]);

  return (
    <ProfileCard className="relative overflow-hidden bg-[linear-gradient(135deg,#f6fbff_0%,#eef6f8_50%,#ffffff_100%)]">
      <div className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.12)] blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-eco)] text-xl font-black text-[var(--green-700)] ring-2 ring-white"
          aria-hidden="true"
        >
          {display.initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            Mi perfil
          </p>
          <h1 className="display-type mt-1 text-2xl font-black text-[var(--ink)] md:text-3xl">
            {display.firstName}
            {display.lastName ? (
              <span className="block text-xl font-bold text-[var(--ink-soft)] md:text-2xl">
                {display.lastName}
              </span>
            ) : null}
          </h1>
          <p className="mt-1 truncate text-sm text-[var(--ink-soft)]">{profile.email}</p>
        </div>
      </div>
    </ProfileCard>
  );
}
