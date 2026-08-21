import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Acompañamiento individualizado VPO con chat y seguimiento',
  description:
    'Acompañamiento 1:1 para vivienda protegida en Cataluña: acceso a chat, revisión de tu caso y ayuda durante todo el proceso hasta presentar la solicitud.',
  path: '/acompanamiento',
  keywords: [
    'acompañamiento VPO',
    'acompañamiento individualizado VPO',
    'chat VPO',
    'vivienda protegida Cataluña',
  ],
});

export default function AccompanimentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Acompañamiento', path: '/acompanamiento' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Acompañamiento individualizado Radar VPO',
            provider: {
              '@type': 'Organization',
              name: 'Radar VPO',
            },
            areaServed: 'Catalonia',
            serviceType: 'Acompañamiento individualizado con chat para acceso a vivienda protegida',
          },
        ]}
      />
      {children}
    </>
  );
}
