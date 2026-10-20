'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';
import { useOptionalProAccess } from '@/components/pro-access-provider';

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

      <div className="mt-6 border-t border-[var(--stroke)] pt-4">
        <h3 className="text-lg font-black text-[var(--ink)]">Tus datos</h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Puedes descargar una copia de tu cuenta o eliminarla. Los registros de compra se conservan el tiempo que
          exija la facturación.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn btn--secondary" onClick={() => void exportData()} disabled={exporting}>
            {exporting ? 'Preparando...' : 'Descargar mis datos'}
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
            <p>Esta acción anonimiza tu cuenta y cierra el acceso. No se puede deshacer.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn btn--secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--secondary !border-red-100 !text-red-700"
                onClick={() => void deleteAccount()}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        ) : null}
        {privacyError ? (
          <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
            {privacyError}
          </p>
        ) : null}
      </div>
    </ProfileCard>
  );
}
