'use client';

import { motion, useReducedMotion } from 'framer-motion';

const metrics = [
  { value: '120+', label: 'Promociones monitorizadas' },
  { value: '3.2k', label: 'Usuarios activos' },
  { value: '48h', label: 'Antelación media alertas' },
  { value: '9,99 €', label: 'VPO PRO al mes' },
] as const;

export function TrustMetrics() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="trust-strip" aria-label="Métricas de confianza">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          className="trust-strip__item"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
        >
          <p className="trust-strip__value">{metric.value}</p>
          <p className="trust-strip__label">{metric.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
