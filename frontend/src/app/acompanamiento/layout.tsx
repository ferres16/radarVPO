import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Acompañamiento personalizado para conseguir tu VPO',
  description:
    'Acompañamiento personalizado para personas que quieren conseguir una VPO: revisión de requisitos, preparación de documentación y seguimiento de oportunidades en Cataluña.',
  path: '/acompanamiento',
  keywords: ['acompañamiento VPO', 'vivienda protegida Cataluña', 'preparación solicitud VPO'],
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
            name: 'Acompañamiento personalizado Radar VPO',
            provider: {
              '@type': 'Organization',
              name: 'Radar VPO',
            },
            areaServed: 'Catalonia',
            serviceType: 'Acompañamiento para acceso a vivienda protegida',
          },
        ]}
      />
      {children}
    </>
  );
}
