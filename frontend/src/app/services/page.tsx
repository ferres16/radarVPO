import Link from 'next/link';

const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || '/register';
const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';

const services = [
  {
    eyebrow: 'Servicio 01',
    title: 'Asesoria personalizada',
    copy:
      'Te acompañamos de principio a fin: revisamos bases, resolvemos tus dudas y te ayudamos a preparar la solicitud correcta antes de que se cierre el plazo.',
    cta: 'Contactar ahora',
    href: 'mailto:soporte@radarvpo.com?subject=Asesoria%20Radar%20VPO',
    accent: 'from-cyan-50 to-emerald-50',
  },
  {
    eyebrow: 'Servicio 02',
    title: 'Seguimiento individualizado',
    copy:
      'Analizamos tu situación concreta y activamos todo el paquete tras contacto previo por WhatsApp.',
    cta: 'Quiero seguimiento',
    href: whatsappContactUrl,
    accent: 'from-white to-cyan-50',
  },
  {
    eyebrow: 'Servicio 03',
    title: 'Radar VPO Pro con SMS',
    copy:
      'Acceso a la guia por Stripe Checkout y activacion de la subscripcion SMS Pro desde la compra.',
    cta: 'Quiero acceso Pro',
    href: stripeCheckoutUrl,
    accent: 'from-emerald-50 to-white',
  },
  {
    eyebrow: 'Servicio 04',
    title: 'Prioridad en requisitos y plazos',
    copy:
      'Si activas seguimiento individualizado, este servicio queda incluido automáticamente con el resto del acompañamiento.',
    cta: 'Ver servicio',
    href: whatsappContactUrl,
    accent: 'from-slate-50 to-emerald-50',
  },
];

export default function ServicesPage() {
  return (
    <main className="shell pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4f8_45%,#ffffff_100%)] p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(56,189,248,0.12)] blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.10)] blur-3xl animate-float-slow-delay" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">Servicios</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[var(--ink)] md:text-6xl display-type">
          Servicios pensados para moverte con criterio en vivienda publica.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--ink-soft)]">
          Asesoria, resolucion de dudas, acompanamiento del proceso, seguimiento individualizado y alertas Pro por SMS en una misma experiencia.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.title}
            className={`group relative overflow-hidden rounded-[1.75rem] border border-[var(--stroke)] bg-gradient-to-br ${service.accent} p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,31,28,0.12)]`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4E8F3A,#A7D08A,#4E8F3A)] opacity-70" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{service.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold text-[var(--ink)]">{service.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{service.copy}</p>
            <Link
              href={service.href}
              className="mt-5 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-300 group-hover:bg-[var(--green-700)]"
            >
              {service.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card">
          <h3 className="text-lg font-bold text-[var(--ink)]">Proceso rápido</h3>
          <ol className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
            <li>1. Nos escribes con tu caso o tu convocatoria objetivo.</li>
            <li>2. Revisamos requisitos, plazos, documentos y respondemos tus dudas en claro.</li>
            <li>3. Te devolvemos un plan accionable y te acompanamos durante todo el proceso.</li>
          </ol>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card">
          <h3 className="text-lg font-bold text-[var(--ink)]">Radar VPO Pro</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Compra la guia por Stripe Checkout y activa la subscripcion SMS Pro para recibir avisos y cambios clave.
          </p>
          <Link href={stripeCheckoutUrl} className="mt-4 inline-flex rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
            Ir a checkout
          </Link>
          <Link href={whatsappContactUrl} className="mt-3 inline-flex rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
            Pedir seguimiento por WhatsApp
          </Link>
        </article>
      </section>

      <section className="mt-6 rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Enfoque</p>
        <h2 className="mt-2 text-xl font-black text-[var(--ink)] display-type">Acompañamiento real, sin servicios que distraen</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
          El foco está en asesoría, seguimiento individualizado y contexto útil para actuar antes. Si necesitas entender una convocatoria, priorizar pasos o no perder una fecha clave, este es el espacio.
        </p>
      </section>
    </main>
  );
}
