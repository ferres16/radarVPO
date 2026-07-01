'use client';

import Link from 'next/link';

type Chip = {
  label: string;
  href: string;
  active?: boolean;
};

export function FilterChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="flex flex-wrap gap-2" role="list">
      {chips.map((chip) =>
        chip.active ? (
          <span key={chip.href} className="chip-filter chip-filter--active" role="listitem">
            {chip.label}
          </span>
        ) : (
          <Link key={chip.href} href={chip.href} className="chip-filter" role="listitem">
            {chip.label}
          </Link>
        ),
      )}
    </div>
  );
}
