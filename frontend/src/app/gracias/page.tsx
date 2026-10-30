import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createMetadata } from '@/lib/seo';
import { GraciasClient } from './gracias-client';

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Gracias por tu compra',
    description: 'Confirmación de pago de Radar VPO.',
    path: '/gracias',
  }),
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
          <p className="text-sm text-[var(--ink-soft)]">Comprobando el pago…</p>
        </main>
      }
    >
      <GraciasClient />
    </Suspense>
  );
}
