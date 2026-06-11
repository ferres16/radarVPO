'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { FileAsset, UserProfile } from '@/types';

function formatBytes(size: number) {
  if (!Number.isFinite(size)) return 'n/d';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminFilesPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryingId, setRetryingId] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);
        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador para gestionar archivos.');
          return;
        }
        const rows = await api.getBackofficeFiles(query || undefined);
        if (active) setFiles(rows);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'No se pudieron cargar archivos');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [query]);

  const failedCount = useMemo(
    () => files.filter((file) => file.status === 'delete_failed').length,
    [files],
  );

  async function retryDelete(fileId: string) {
    setRetryingId(fileId);
    setError('');
    try {
      const updated = await api.retryBackofficeFileDeletion(fileId);
      setFiles((prev) => prev.map((file) => (file.id === fileId ? updated : file)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reintentar el borrado');
    } finally {
      setRetryingId('');
    }
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell pb-16">
        <SurfaceCard className="p-6 text-sm text-amber-900">{error}</SurfaceCard>
      </main>
    );
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-5">
          <PageHero
            eyebrow="Gestión de archivos"
            title="Assets centralizados en S3"
            description="Audita archivos vinculados a promociones, cursos, lecciones, noticias y servicios. Los borrados fallidos quedan marcados para reintento."
          />

          <section className="grid gap-3 md:grid-cols-3">
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Archivos listados</p>
              <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">{files.length}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Borrados fallidos</p>
              <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">{failedCount}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Buscar
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="ds-control mt-2"
                  placeholder="Nombre, s3 key o entidad"
                />
              </label>
            </SurfaceCard>
          </section>

          {error ? <SurfaceCard className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</SurfaceCard> : null}
          {loading ? <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">Cargando archivos...</SurfaceCard> : null}

          <SurfaceCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--stroke)] bg-[var(--bg-app)] text-left text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    <th className="p-3">Archivo</th>
                    <th className="p-3">Entidad</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Tamaño</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b border-[var(--stroke)] align-top last:border-b-0">
                      <td className="p-3">
                        <p className="font-semibold text-[var(--ink)]">{file.originalName}</p>
                        <p className="mt-1 max-w-sm truncate text-xs text-[var(--ink-soft)]">{file.s3Key}</p>
                      </td>
                      <td className="p-3">{file.entityType} · {file.entityId}</td>
                      <td className="p-3">{file.mimeType}</td>
                      <td className="p-3">{formatBytes(file.size)}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-[var(--bg-app)] px-2 py-1 text-xs font-semibold text-[var(--ink)]">{file.status}</span>
                        {file.deleteError ? <p className="mt-2 text-xs text-red-700">{file.deleteError}</p> : null}
                      </td>
                      <td className="p-3">
                        {file.status === 'delete_failed' ? (
                          <button
                            type="button"
                            disabled={retryingId === file.id}
                            onClick={() => void retryDelete(file.id)}
                            className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)] disabled:opacity-60"
                          >
                            {retryingId === file.id ? 'Reintentando...' : 'Reintentar borrado'}
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--ink-soft)]">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  );
}
