export function RadarVisual({ className = '' }: { className?: string }) {
  return (
    <div className={`radar-visual ${className}`} aria-hidden="true">
      <div className="radar-visual__grid" />
      <div className="radar-visual__ring radar-visual__ring--1" />
      <div className="radar-visual__ring radar-visual__ring--2" />
      <div className="radar-visual__ring radar-visual__ring--3" />
      <div className="radar-visual__sweep" />
      <div className="radar-visual__core" />
      <div className="radar-visual__blip radar-visual__blip--1" />
      <div className="radar-visual__blip radar-visual__blip--2" />
      <div className="radar-visual__blip radar-visual__blip--3" />
    </div>
  );
}
