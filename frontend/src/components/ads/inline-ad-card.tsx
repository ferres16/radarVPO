import { AdSlot } from './ad-slot';

export function InlineAdCard({ className = '' }: { className?: string }) {
  return (
    <AdSlot
      slot="inline"
      className={`rounded-[1.5rem] border border-[var(--stroke)] bg-white p-4 shadow-sm ${className}`}
      minHeight={140}
      label="Publicidad"
    />
  );
}
