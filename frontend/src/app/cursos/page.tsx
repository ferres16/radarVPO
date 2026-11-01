import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GUIDE_VPO_HREF, GUIDE_VPO_SEO_DESCRIPTION } from '@/lib/guide-vpo';
import { createMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Guía de vivienda protegida',
  description: GUIDE_VPO_SEO_DESCRIPTION,
  path: '/cursos',
  keywords: [
    'guía VPO Cataluña',
    'registro solicitantes VPO',
    'documentación VPO',
    'vivienda protegida Catalunya',
    'Radar VPO',
  ],
});

/**
 * Una sola guía: la ficha concentra marketing + pago.
 * El ancla #pagar va en los botones de nav (el Location HTTP no conserva hash).
 */
export default function CoursesPage() {
  redirect(GUIDE_VPO_HREF);
}
