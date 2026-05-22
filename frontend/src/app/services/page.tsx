import Link from 'next/link';

const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || '/register';
const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20activar%20el%20seguimiento%20individualizado%20de%20Radar%20VPO.';

const services = [
  {
    eyebrow: '01 · Cursos y formaciones',
    title: 'Cursos y formaciones activas',
    copy:
      'Microlecciones, guias vivas y recursos descargables para entender requisitos, plazos y estrategias reales.',
    cta: 'Ver cursos',
    href: '/cursos',
    accent: 'from-cyan-50 to-white',
  },
  {
    eyebrow: '02 · Alertas Pro',
    title: 'Alertas de promociones Pro',
    copy:
      'Avisos de nuevas promociones, cambios en bases y recordatorios de fechas criticas directamente en WhatsApp.',
    cta: 'Activar alertas Pro',
    href: whatsappContactUrl,
    accent: 'from-emerald-50 to-white',
  },
  {
    eyebrow: '03 · Asesoria personalizada',
    title: 'Asesoria personalizada integral',
    copy:
      'Incluye acceso a todos los servicios: cursos, alertas Pro y acompañamiento 1:1 para cada convocatoria.',
    cta: 'Quiero asesoria',
    href: whatsappContactUrl,
    accent: 'from-white to-cyan-50',
  },
];

export default function ServicesPage() {
  return (
    <main className="shell pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,#f4fbff_0%,#eef7f1_55%,#ffffff_100%)] p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(56,189,248,0.12)] blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.10)] blur-3xl animate-float-slow-delay" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">Servicios</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[var(--ink)] md:text-6xl display-type">
          Tres puertas para avanzar con seguridad en VPO.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--ink-soft)]">
          Cursos y formaciones, alertas Pro en WhatsApp y asesoria personalizada con acceso total a todo el ecosistema Radar VPO.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
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

      <section className="mt-6 rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Metodo Radar VPO</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--ink)] display-type">Entra, entiende y actua sin perder oportunidades</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
              La asesoria incluye el acceso completo: cursos activos, alertas Pro y acompañamiento 1:1. Un solo lugar para avanzar con seguridad.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Ruta rapida</p>
            <ol className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
              <li>1. Elige el servicio que necesitas hoy.</li>
              <li>2. Recibe guia clara y respuestas directas.</li>
              <li>3. Acompañamiento continuo hasta el cierre.</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={stripeCheckoutUrl} className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
                Ir a checkout
              </Link>
              <Link href={whatsappContactUrl} className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
                Hablar por WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
