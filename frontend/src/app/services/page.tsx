import Link from 'next/link';

const services = [
  {
    eyebrow: 'Servicio 01',
    title: 'Asesoria personalizada',
    copy:
      'Te acompañamos de principio a fin: revisamos bases, resolvemos tus dudas y te ayudamos a preparar la solicitud correcta antes de que se cierre el plazo.',
    cta: 'Contactar ahora',
    href: 'mailto:soporte@radarvpo.com?subject=Asesoria%20Radar%20VPO',
    accent: 'from-emerald-50 to-lime-50',
  },
  {
    eyebrow: 'Servicio 02',
    title: 'Guia PDF de compra',
    copy:
      'Una guia descargable y comprable con pasos claros, checklist y errores frecuentes para no perder convocatorias.',
    cta: 'Pedir la guia',
    href: 'mailto:soporte@radarvpo.com?subject=Compra%20guia%20PDF%20Radar%20VPO',
    accent: 'from-white to-emerald-50',
  },
  {
    eyebrow: 'Servicio 03',
    title: 'Radar VPO Pro con SMS',
    copy:
      'Alertas por SMS para enterarte antes que nadie de nuevas promociones, cambios de estado y plazos clave.',
    cta: 'Quiero acceso Pro',
    href: '/register',
    accent: 'from-lime-50 to-white',
  },
  {
    eyebrow: 'Servicio 04',
    title: 'Extraccion de PDF o texto a JSON',
    copy:
      'Analizamos tu documento y devolvemos un unico JSON valido con informacion de fechas, contacto, economia, requisitos y cuotas o reservas, sin bloques vacios.',
    cta: 'Solicitar extraccion',
    href: 'mailto:soporte@radarvpo.com?subject=Extraccion%20PDF%20a%20JSON',
    accent: 'from-emerald-50 to-white',
  },
];

export default function ServicesPage() {
  return (
    <main className="shell pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,#f7f8f5_0%,#eef6ea_45%,#fff_100%)] p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(78,143,58,0.12)] blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.10)] blur-3xl animate-float-slow-delay" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">Servicios</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[var(--ink)] md:text-6xl">
          Servicios pensados para moverte antes que nadie en vivienda publica.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--ink-soft)]">
          Asesoria, resolucion de dudas, acompanamiento del proceso, guia PDF, extraccion de datos y alertas Pro por SMS en una misma experiencia.
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
            Recibe avisos por SMS y entra en modo vigilancia total para que no se te escape una salida nueva.
          </p>
          <Link href="/register" className="mt-4 inline-flex rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
            Activar interés
          </Link>
        </article>
      </section>

      <section className="mt-6 rounded-[1.75rem] border border-[var(--stroke)] bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Formato de salida para extraccion</p>
        <h2 className="mt-2 text-xl font-black text-[var(--ink)]">JSON unico, limpio y listo para usar</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
          A partir de un PDF o texto, devolvemos un unico JSON valido. Si una seccion no tiene datos, se elimina. No se inventa informacion ni se repiten estructuras.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-xs leading-6 text-[var(--ink)]">
{`{
  "fechas": {},
  "contacto": {},
  "economia": {},
  "requisitos": {},
  "cuotas_reservas": {}
}`}
        </pre>
      </section>
    </main>
  );
}
