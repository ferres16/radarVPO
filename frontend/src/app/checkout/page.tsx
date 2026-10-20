import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckoutPanel, type CheckoutSummary } from '@/components/checkout/checkout-panel';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink } from '@/components/design-system';
import {
  COURSE_ACCESS_DURATION_TEXT,
  GUIDE_FORMAT_TEXT,
  PRICE_FINAL_NOTE,
  formatEuro,
  getCourseStatusSummary,
  getCoursePrice,
  isGuidePdf,
} from '@/lib/offer';
import { isInternalCatalogCourse } from '@/lib/public-courses';
import { supportEmail } from '@/lib/legal';
import { proIncludes, proPlan } from '@/lib/pro';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Finalizar compra',
    description: 'Resumen del pedido y pago seguro.',
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
  const canceled = params.canceled === '1';

  let summary: CheckoutSummary;

  if (params.product === 'pro') {
    const checkoutStatus = await api.getCheckoutStatus().catch(() => null);
    const proAmount =
      checkoutStatus && Number.isInteger(checkoutStatus.proPriceCents) && checkoutStatus.proPriceCents > 0
        ? checkoutStatus.proPriceCents / 100
        : proPlan.priceAmount;
    summary = {
      product: 'pro',
      title: proPlan.name,
      priceLabel: formatEuro(proAmount, { decimals: 2 }),
      cadenceLabel: 'al mes',
      recurrenceNote:
        'Suscripción mensual con renovación automática. Cancelas cuando quieras desde Mi cuenta y conservas el acceso hasta el final del periodo pagado.',
      bullets: [
        ...proIncludes.map((item) => `${item.title}: ${item.description}`),
        PRICE_FINAL_NOTE,
      ],
      backHref: '/pro',
      backLabel: 'Volver a Radar VPO PRO',
    };
  } else if (params.product === 'pro_pack_3m') {
    summary = {
      product: 'pro_pack_3m',
      title: 'Radar VPO PRO · Pack 3 meses',
      priceLabel: formatEuro(29.97, { decimals: 2 }),
      cadenceLabel: 'cada 3 meses',
      recurrenceNote:
        'Incluye avisos PRO y la guía inicial de forma permanente. El cobro se renueva cada 3 meses hasta que canceles.',
      bullets: [
        ...proIncludes
          .filter((item) => !item.title.toLowerCase().includes('curso'))
          .map((item) => `${item.title}: ${item.description}`),
        'Guía inicial incluida al pagar el pack (acceso permanente).',
      ],
      backHref: '/pro',
      backLabel: 'Volver a Radar VPO PRO',
    };
  } else if (params.product === 'course' && params.course) {
    const course = await api.getCourse(params.course).catch(() => null);
    if (!course || isInternalCatalogCourse(course)) {
      return <Unavailable message="No encontramos este curso." href="/cursos" label="Ver cursos" />;
    }
    const status = getCourseStatusSummary(course);
    const price = getCoursePrice(course);
    if (!status.sellable || price === null) {
      return (
        <Unavailable
          message={`“${course.title}” todavía está en preparación (${status.statusText}) y no se puede comprar.`}
          href={`/cursos/${course.slug}`}
          label="Ver el programa del curso"
        />
      );
    }
    summary = {
      product: 'course',
      courseSlug: course.slug,
      title: course.title,
      priceLabel: formatEuro(price),
      cadenceLabel: 'pago único',
      recurrenceNote: 'Sin renovaciones ni cuotas posteriores.',
      bullets: [
        status.statusText,
        COURSE_ACCESS_DURATION_TEXT,
        ...(isGuidePdf(course) ? [GUIDE_FORMAT_TEXT] : []),
        PRICE_FINAL_NOTE,
        'Acceso inmediato tras confirmarse el pago.',
      ],
      backHref: `/cursos/${course.slug}`,
      backLabel: 'Volver al curso',
    };
  } else {
    return <Unavailable message="No hemos entendido qué quieres comprar." href="/cursos" label="Ver cursos" />;
  }

  return (
    <PublicPage>
      <PublicPageHero
        badge="Pedido"
        title="Finalizar compra"
        description="Revisa el resumen, confirma las condiciones y paga de forma segura."
        animated={false}
      />
      <PublicSection animated={false}>
        <CheckoutPanel summary={summary} canceled={canceled} />
        <p className="mt-6 text-center text-xs text-[var(--ink-soft)]">
          ¿Dudas sobre tu compra? Consulta las{' '}
          <Link href="/condiciones" className="font-semibold text-[var(--green-700)]">
            condiciones
          </Link>{' '}
          o escribe a{' '}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--green-700)] underline">
            {supportEmail}
          </a>
          .
        </p>
      </PublicSection>
    </PublicPage>
  );
}
