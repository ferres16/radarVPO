import Link from 'next/link';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/promotions', label: 'Todas las promociones' },
  { href: '/services', label: 'Servicios' },
  { href: '/account', label: 'Tu cuenta' },
];

export function TopNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--stroke)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-extrabold uppercase tracking-wide text-[var(--green-700)]">
          Radar VPO
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
