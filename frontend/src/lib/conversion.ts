import { FREE_SAVED_PROMOTIONS_LIMIT } from '@/lib/my-space';
import { proPriceLabel } from '@/lib/offer';

/** Problemas reales de quien solicita vivienda protegida (sin cifras ni promesas). */
export const homeProblemCards = [
  {
    title: 'La información está dispersa',
    description:
      'Las promociones y sus bases se publican en distintos sitios y en documentos largos que cuesta localizar.',
  },
  {
    title: 'Cuesta saber si cumples los requisitos',
    description:
      'Cada promoción tiene sus propias condiciones, y los plazos y la documentación pueden sorprender.',
  },
  {
    title: 'Se pierde el hilo de lo que sigues',
    description:
      'Con varias promociones a la vez, es fácil olvidar qué has leído, qué falta y qué has presentado ya.',
  },
] as const;

/** Tres caminos de entrada: consultar, aprender, avisos. */
export const homePaths = [
  {
    id: 'consult',
    eyebrow: 'Gratis',
    title: 'Consulta las promociones',
    description:
      'Mira las promociones publicadas y abre directamente su documento oficial, sin registrarte.',
    cta: 'Ver promociones',
    href: '/promotions',
  },
  {
    id: 'learn',
    eyebrow: 'Curso',
    title: 'Aprende a preparar tu solicitud',
    description:
      'Un curso práctico para entender el proceso: qué es una VPO, requisitos, registro de solicitantes y cómo leer los anuncios.',
    cta: 'Ver el curso',
    href: '/cursos',
  },
  {
    id: 'pro',
    eyebrow: 'Suscripción',
    title: 'Recibe avisos y organízate',
    description: `Avisos por email y SMS de nuevas promociones y un espacio para organizar las que sigues. ${proPriceLabel}.`,
    cta: 'Ver Radar VPO PRO',
    href: '/pro',
  },
] as const;

export const homeFaqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer:
      'Un sitio para consultar promociones de vivienda protegida en Cataluña con su documento oficial, aprender a preparar la solicitud con un curso y organizar las oportunidades que sigues.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer: `Sí. Consultar las promociones y abrir su documento oficial en PDF es gratis. Con una cuenta gratuita también puedes guardar hasta ${FREE_SAVED_PROMOTIONS_LIMIT} promociones en Mi espacio.`,
  },
  {
    question: '¿Qué es Radar VPO PRO?',
    answer: `Una suscripción de ${proPriceLabel} que añade avisos por email y SMS de nuevas promociones, Mi espacio sin límite y acceso al curso inicial mientras esté activa. Se cancela desde Mi cuenta.`,
  },
  {
    question: '¿Los cursos son una suscripción?',
    answer:
      'No. Cada curso es un pago único con el precio final visible antes de pagar; no hay renovaciones.',
  },
  {
    question: '¿Radar VPO presenta la solicitud por mí o me asesora individualmente?',
    answer:
      'No. Radar VPO ofrece información, un curso y herramientas de organización. Cada persona presenta su propia solicitud ante los organismos oficiales.',
  },
  {
    question: '¿Garantiza conseguir un piso protegido?',
    answer:
      'No. La adjudicación depende siempre de los organismos oficiales. Radar VPO te ayuda a informarte y a prepararte.',
  },
] as const;
