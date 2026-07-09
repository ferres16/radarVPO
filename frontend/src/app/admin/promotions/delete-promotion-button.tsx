'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export function DeletePromotionButton({ promotionId }: { promotionId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const accepted = window.confirm(
      'Se eliminará la promoción y todos sus archivos asociados en S3. ¿Continuar?',
    );
    if (!accepted) return;

    setDeleting(true);
    try {
      await api.deleteBackofficePromotion(promotionId);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo eliminar la promoción');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleDelete()}
      disabled={deleting}
      className="rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      {deleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  );
}
