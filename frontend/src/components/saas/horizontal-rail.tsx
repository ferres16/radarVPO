import type { ReactNode } from 'react';

export function HorizontalRail({
  children,
  columns = 2,
  className = '',
}: {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}) {
  const trackClass = columns === 3 ? 'h-rail__track h-rail__track--3' : 'h-rail__track';
  return (
    <div className={`h-rail ${className}`.trim()}>
      <div className={trackClass}>{children}</div>
    </div>
  );
}

export function HorizontalRailItem({ children }: { children: ReactNode }) {
  return <div className="h-rail__item">{children}</div>;
}
