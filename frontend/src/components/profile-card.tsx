import type { ReactNode } from 'react';

type ProfileCardProps = {
  children: ReactNode;
  className?: string;
};

export function ProfileCard({ children, className = "" }: ProfileCardProps) {
  return (
    <article
      className={`rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card ${className}`}
    >
      {children}
    </article>
  );
}
