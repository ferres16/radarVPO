import { RadarVisual } from '@/components/radar-visual';

export function PromotionsHeroVisual() {
  return (
    <div className="hero-visual hero-visual--promo" aria-hidden="true">
      <div className="hero-visual__card hero-visual__card--float-a">
        <p className="hero-visual__chip hero-visual__chip--live">Activa</p>
        <p className="hero-visual__card-title">Cooperativa Barcelona</p>
        <p className="hero-visual__card-meta">Plazo abierto · 14 días</p>
      </div>
      <div className="hero-visual__card hero-visual__card--float-b">
        <p className="hero-visual__chip">VPO</p>
        <p className="hero-visual__card-title">Sant Cugat · 48 viviendas</p>
        <p className="hero-visual__card-meta">Requisitos listos</p>
      </div>
      <div className="hero-visual__stat">
        <span className="hero-visual__stat-value">12</span>
        <span className="hero-visual__stat-label">oportunidades activas</span>
      </div>
    </div>
  );
}

export function AlertsHeroVisual() {
  return (
    <div className="hero-visual hero-visual--alerts" aria-hidden="true">
      <RadarVisual className="hero-visual__radar" />
      <div className="hero-visual__card hero-visual__card--float-a hero-visual__card--dark">
        <p className="hero-visual__chip hero-visual__chip--urgent">Radar activo</p>
        <p className="hero-visual__card-title">Señal detectada</p>
        <p className="hero-visual__card-meta">Publicación estimada · 9 días</p>
      </div>
      <div className="hero-visual__notify">
        <span className="hero-visual__notify-dot" />
        SMS + email con PRO
      </div>
    </div>
  );
}

export function AcademyHeroVisual() {
  return (
    <div className="hero-visual hero-visual--academy" aria-hidden="true">
      <div className="hero-visual__card hero-visual__card--float-a">
        <p className="hero-visual__chip hero-visual__chip--pro">Incluido en PRO</p>
        <p className="hero-visual__card-title">Curso VPO completo</p>
        <p className="hero-visual__card-meta">Requisitos · documentación · plazos</p>
      </div>
      <div className="hero-visual__progress">
        <div className="hero-visual__progress-bar" style={{ width: '68%' }} />
        <p className="hero-visual__card-meta">Preparación antes del plazo</p>
      </div>
    </div>
  );
}

export function AccompanimentHeroVisual() {
  return (
    <div className="hero-visual hero-visual--support" aria-hidden="true">
      <div className="hero-visual__card hero-visual__card--float-a">
        <p className="hero-visual__chip">Paso 2</p>
        <p className="hero-visual__card-title">Revisión de documentación</p>
        <p className="hero-visual__card-meta">Checklist personalizado</p>
      </div>
      <div className="hero-visual__steps">
        <span>1. Caso</span>
        <span className="hero-visual__steps-active">2. Revisión</span>
        <span>3. Plazo</span>
      </div>
    </div>
  );
}
