import Link from 'next/link';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/promotions', label: 'Promos' },
  { href: '/favorites', label: 'Favoritos' },
  { href: '/account', label: 'Cuenta' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--stroke)] bg-white/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around p-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
