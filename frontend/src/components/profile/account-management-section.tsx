'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';
import { useOptionalProAccess } from '@/components/pro-access-provider';

/**
 * Acceso (sesión/contraseña) es utilidad, no un bloque legal obligatorio.
 * Descargar/eliminar facilitan derechos RGPD: van en un detalle discreto.
 */
export function AccountManagementSection() {
  const proAccess = useOptionalProAccess();
  const [loggingOut, setLoggingOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [privacyError, setPrivacyError] = useState('');

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Ignore logout failures and still clear local state.
    } finally {
      proAccess?.setMe(null);
      setLoggingOut(false);
      window.location.assign('/');
    }
  }

  async function exportData() {
    if (exporting) return;
    setExporting(true);
    setPrivacyError('');
    try {
      const data = await api.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'radar-vpo-mis-datos.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPrivacyError(error instanceof Error ? error.message : 'No se pudo descargar tus datos.');
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (deleting) return;
    setDeleting(true);
    setPrivacyError('');
    try {
      await api.deleteMyAccount();
      try {
        await api.logout();
      } catch {
        // La cuenta ya está anonimizada; el cierre de cookies es best-effort.
      }
      proAccess?.setMe(null);
      window.location.assign('/');
    } catch (error) {
      setPrivacyError(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.');
      setDeleting(false);
    }
  }

  return (
    <ProfileCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            Cuenta
          </p>
          <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)]">Acceso</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/forgot-password" className="btn btn--secondary">
            Cambiar contraseña
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={loggingOut}
            className="btn btn--secondary"
          >
            {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      <details className="mt-5 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
          Privacidad: descargar o eliminar datos
        </summary>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Derechos sobre tu cuenta en Radar VPO (no es un trámite de vivienda). Los registros de compra
          se conservan el tiempo legalmente exigible de facturación. También puedes escribir a soporte
          desde{' '}
          <Link href="/contacto" className="font-semibold text-[var(--green-700)] underline">
            Contacto
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => void exportData()}
            disabled={exporting}
          >
            {exporting ? 'Preparando…' : 'Descargar mis datos'}
          </button>
          <button
            type="button"
            className="btn btn--secondary !border-red-100 !text-red-700"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
          >
            Eliminar cuenta
          </button>
        </div>
        {confirmDelete ? (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-800">
            <p>Se anonimiza tu cuenta y se cierra el acceso. No se puede deshacer.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--secondary !border-red-100 !text-red-700"
                onClick={() => void deleteAccount()}
                disabled={deleting}
              >
                {deleting ? 'Eliminando…' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        ) : null}
        {privacyError ? (
          <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
            {privacyError}
          </p>
        ) : null}
      </details>
    </ProfileCard>
  );
}
