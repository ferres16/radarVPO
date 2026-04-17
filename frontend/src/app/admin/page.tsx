import { api } from '@/lib/api';

export default async function AdminPage() {
  const [overview, jobs, failures] = await Promise.all([
    api.getBackofficeOverview(),
    api.getBackofficeJobs(),
    api.getBackofficeFailures(),
  ]);

  return (
    <main className="shell">
      <h1 className="mb-4 text-2xl font-bold text-[var(--ink)]">Backoffice</h1>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(overview).map(([key, value]) => (
          <article key={key} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">{key}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--ink)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Jobs recientes</h2>
          <div className="mt-3 space-y-2">
            {jobs.slice(0, 8).map((job) => (
              <div key={job.id} className="rounded-xl border border-[var(--stroke)] p-3 text-sm">
                <p className="font-semibold text-[var(--ink)]">{job.jobName}</p>
                <p className="text-[var(--ink-soft)]">Estado: {job.status}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Fallos de entrega</h2>
          <div className="mt-3 space-y-2">
            {failures.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--stroke)] p-3 text-sm">
                <p className="font-semibold text-[var(--ink)]">{item.target}</p>
                <p className="text-[var(--ink-soft)]">{item.errorCode} - {item.channel}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
