import { appEnv, isProductionSite } from '@/lib/app-env';

export function EnvironmentBadge() {
  if (isProductionSite) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-2 left-2 z-[70] rounded-md bg-amber-400 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-black shadow"
    >
      Entorno de pruebas · {appEnv}
    </div>
  );
}
