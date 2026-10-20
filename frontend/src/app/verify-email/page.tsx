'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ButtonLink } from '@/components/design-system';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { api } from '@/lib/api';
import { useProAccess } from '@/components/pro-access-provider';

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token')?.trim() || '';
  const { me, refresh } = useProAccess();
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setStatus('working');
    api
      .verifyEmail(token)
      .then(async (result) => {
        if (!active) return;
        setStatus('ok');
        setMessage(result.message);
        await refresh?.();
        setTimeout(() => router.replace('/account'), 1500);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'No se pudo verificar el email.');
      });
    return () => {
      active = false;
    };
  }, [token, refresh, router]);

  async function resend() {
    setResending(true);
    setMessage('');
    try {
      const result = await api.resendVerificationEmail();
      setMessage(result.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo reenviar.');
    } finally {
      setResending(false);
    }
  }

  return (
    <PublicPage>
      <PublicPageHero
        badge="Cuenta"
        title="Verificar email"
        description="Confirma tu dirección para comprar y activar avisos PRO."
        animated={false}
      />
      <PublicSection animated={false}>
        <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-[var(--stroke)] bg-white p-6">
          {!token ? (
            <>
              <p className="text-sm leading-6 text-[var(--ink-soft)]">
                {me
                  ? me.emailVerifiedAt
                    ? 'Tu email ya está verificado.'
                    : `Te enviaremos un enlace a ${me.email}.`
                  : 'Inicia sesión para reenviar el enlace de verificación.'}
              </p>
              {me && !me.emailVerifiedAt ? (
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  disabled={resending}
                  onClick={() => void resend()}
                >
                  {resending ? 'Enviando…' : 'Reenviar correo de verificación'}
                </button>
              ) : null}
              {!me ? (
                <ButtonLink href="/login?next=/verify-email" size="lg" block>
                  Iniciar sesión
                </ButtonLink>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-6 text-[var(--ink)]" role="status">
              {status === 'working'
                ? 'Verificando…'
                : status === 'ok'
                  ? message || 'Email verificado.'
                  : message || 'Error al verificar.'}
            </p>
          )}
          {message && status !== 'working' && !token ? (
            <p className="text-sm text-[var(--ink-soft)]">{message}</p>
          ) : null}
          <Link href="/account" className="inline-block text-sm font-bold text-[var(--green-700)]">
            Ir a Mi cuenta
          </Link>
        </div>
      </PublicSection>
    </PublicPage>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <PublicPage>
          <PublicPageHero badge="Cuenta" title="Verificar email" description="Cargando…" animated={false} />
        </PublicPage>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
