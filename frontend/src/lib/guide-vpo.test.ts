import { describe, expect, it } from 'vitest';
import {
  GUIDE_VPO_CHAPTERS,
  GUIDE_VPO_FAQS,
  GUIDE_VPO_NOT_INCLUDED,
  GUIDE_VPO_TITLE,
  getPublicCourseDescription,
  getPublicCourseTitle,
  isGuideVpoSlug,
} from './guide-vpo';

const publicCopy = [
  GUIDE_VPO_TITLE,
  getPublicCourseDescription({ slug: 'guiav1' }),
  ...GUIDE_VPO_CHAPTERS.flatMap((chapter) => [chapter.title, chapter.hook, chapter.readerCare]),
  ...GUIDE_VPO_FAQS.flatMap((item) => [item.question, item.answer]),
  ...GUIDE_VPO_NOT_INCLUDED,
].join('\n');

describe('Guía VPO public copy', () => {
  it('overrides the internal slug title with the public product name', () => {
    expect(isGuideVpoSlug('guiav1')).toBe(true);
    expect(getPublicCourseTitle({ slug: 'guiav1', title: 'guiav1' })).toBe(GUIDE_VPO_TITLE);
    expect(getPublicCourseTitle({ slug: 'otro', title: 'Otro curso' })).toBe('Otro curso');
  });

  it('sells process and preparation, not a personal story or 1:1 help', () => {
    const description = getPublicCourseDescription({ slug: 'guiav1' });
    expect(description).toMatch(/pasos|proceso|números/i);
    expect(description).toMatch(/entiende|preparar/i);
    expect(publicCopy).not.toMatch(/Carlos|Horta|Cómo conseguir una vivienda/i);
    expect(GUIDE_VPO_NOT_INCLUDED.join(' ')).toMatch(/acompañamiento 1:1/);
  });

  it('lists the 12 advertising themes with a concrete hook each', () => {
    expect(GUIDE_VPO_CHAPTERS).toHaveLength(12);
    expect(GUIDE_VPO_CHAPTERS.map((chapter) => chapter.title)).toEqual([
      'Primeros pasos',
      'Registro de Solicitantes',
      'Requisitos e ingresos',
      'Documentación',
      'Ahorro y gastos',
      'Pública, privada y cooperativa',
      'Pleno dominio y derecho de superficie',
      'Precios, garaje y trastero',
      'Reserva, arras y visado',
      'Obligaciones posteriores',
      'Checklist de documentación',
      'Enlaces oficiales y glosario',
    ]);
    expect(GUIDE_VPO_CHAPTERS.every((chapter) => chapter.hook.length > 12)).toBe(true);
  });
});
