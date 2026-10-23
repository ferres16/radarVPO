import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink } from '@/components/design-system';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Finalizar compra',
    description: 'Pago seguro en la ficha del producto.',
    path: '/checkout',
  }),
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ product?: string; course?: string; canceled?: string }>;

function Unavailable({ message, href, label }: { message: string; href: string; label: string }) {
  return (
    <PublicPage>
      <PublicPageHero badge="Pedido" title="Producto no disponible" description={message} animated={false} />
      <PublicSection animated={false}>
        <div className="mx-auto max-w-md">
          <ButtonLink href={href} size="lg" block>
            {label}
          </ButtonLink>
        </div>
      </PublicSection>
    </PublicPage>
  );
}

export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const canceledQuery = params.canceled === '1' ? '?canceled=1' : '';

  if (params.product === 'pro' || params.product === 'pro_pack_3m') {
    redirect(`/pro${canceledQuery}`);
  }
  if (params.product === 'course' && params.course) {
    redirect(`/cursos/${params.course}${canceledQuery}`);
  }

  return <Unavailable message="No hemos entendido qué quieres comprar." href="/cursos" label="Ver cursos" />;
}
