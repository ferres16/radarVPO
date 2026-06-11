import { AdSlot } from './ad-slot';

export function SidebarAds() {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        <AdSlot slot="sidebar" minHeight={280} label="Publicidad lateral" />
        <AdSlot slot="card" minHeight={220} label="Contenido patrocinado" />
      </div>
    </div>
  );
}
