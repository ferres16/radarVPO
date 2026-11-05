'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrackedButtonLink } from '@/components/tracked-link';
import { useProAccess } from '@/components/pro-access-provider';
import { api } from '@/lib/api';
import {
  loginHref,
  registerBenefits,
  registerHref,
  registerPromoCopy,
  type RegisterPromoReason,
} from '@/lib/register-promo';

/** Botón de registro que solo aparece a quien aún no tiene cuenta. */
export function RegisterButton({
  next,
  source,
  children,
  variant = 'primary',
  size = 'lg',
  block = false,
  fallback = null,
}: {
  next?: string;
  source: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  block?: boolean;
  fallback?: React.ReactNode;
}) {
  const { me, loading } = useProAccess();
  if (loading || me) return <>{fallback}</>;
  return (
    <TrackedButtonLink
      href={registerHref(next)}
      size={size}
      variant={variant}
      block={block}
      event="register_cta_clicked"
      eventProperties={{ source }}
    >
      {children}
    </TrackedButtonLink>
  );
}

type Props = {
  reason?: RegisterPromoReason;
  /** Ruta a la que volver tras registrarse. */
  next?: string;
  compact?: boolean;
  className?: string;
};

/**
 * Invitación a registrarse. Se adapta a quién mira:
 * sin sesión → registrarse; con sesión sin confirmar → confirmar email; con todo → nada.
 */
export function RegisterPromo({ reason = 'general', next, compact = false, className = '' }: Props) {
  const { me, loading } = useProAccess();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const copy = registerPromoCopy[reason];

  if (loading) return null;
  if (me?.emailVerifiedAt) return null;

  if (me) {
    async function resend() {
      setSending(true);
      setMessage('');
      try {
        const out = await api.resendVerificationEmail();
        setMessage(out.message);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'No se pudo reenviar.');
      } finally {
        setSending(false);
      }
    }

    return (
      <aside className={`register-promo register-promo--pending ${className}`}>
        <div>
          <p className="register-promo__label">Te falta un paso</p>
          <p className="register-promo__title">{copy.pendingTitle}</p>
          <p className="register-promo__text">
            Abre el enlace que te enviamos a <strong>{me.email}</strong> y se desbloquea al momento.
          </p>
          {message ? (
            <p className="register-promo__text font-semibold" role="status">
              {message}
            </p>
          ) : null}
        </div>
        <div className="register-promo__actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={sending}
            onClick={() => void resend()}
          >
            {sending ? 'Enviando…' : 'Reenviar email'}
          </button>
          <Link href="/account" className="register-promo__secondary">
            Cambiar email
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`register-promo ${compact ? 'register-promo--compact' : ''} ${className}`}>
      <div>
        <p className="register-promo__label">Cuenta gratuita</p>
        <p className="register-promo__title">{copy.title}</p>
        <p className="register-promo__text">{copy.text}</p>
        {!compact ? (
          <ul className="register-promo__list">
            {registerBenefits.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="register-promo__actions">
        <TrackedButtonLink
          href={registerHref(next)}
          size="lg"
          event="register_cta_clicked"
          eventProperties={{ source: 'register_promo', reason }}
        >
          {copy.cta}
        </TrackedButtonLink>
        <Link href={loginHref(next)} className="register-promo__secondary">
          Ya tengo cuenta · Entrar
        </Link>
      </div>
    </aside>
  );
}
