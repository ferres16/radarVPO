import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Servicios premium de seguimiento VPO',
  description:
    'Contrata seguimiento personalizado, asesorías 1:1 y alertas Pro para vivienda protegida, HPO y VPO en Cataluña.',
  path: '/services',
  keywords: ['servicios vivienda protegida', 'seguimiento VPO', 'asesoría vivienda protegida'],
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Servicios', path: '/services' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Servicios premium Radar VPO',
            provider: {
              '@type': 'Organization',
              name: 'Radar VPO',
            },
            areaServed: 'Catalonia',
            serviceType: 'Seguimiento y asesoría de vivienda protegida',
          },
        ]}
      />
      {children}
    </>
  );
}
