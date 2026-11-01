import { describe, expect, it } from 'vitest';
import {
  GUIDE_VPO_CHAPTERS,
  GUIDE_VPO_CHECKOUT_HREF,
  GUIDE_VPO_FAQS,
  GUIDE_VPO_INCLUDES,
  GUIDE_VPO_NOT_INCLUDED,
  GUIDE_VPO_OUTCOMES,
  GUIDE_VPO_TITLE,
  getPublicCourseDescription,
  getPublicCourseTitle,
  isGuideVpoSlug,
} from './guide-vpo';

const publicCopy = [
  GUIDE_VPO_TITLE,
  getPublicCourseDescription({ slug: 'guiav1' }),
  ...GUIDE_VPO_CHAPTERS.flatMap((chapter) => [chapter.title, chapter.hook, chapter.readerCare]),
  ...GUIDE_VPO_OUTCOMES.flatMap((item) => [item.title, item.text]),
  ...GUIDE_VPO_INCLUDES,
  ...GUIDE_VPO_FAQS.flatMap((item) => [item.question, item.answer]),
  ...GUIDE_VPO_NOT_INCLUDED,
].join('\n');

describe('Guía VPO public copy', () => {
  it('overrides the internal slug title with the public product name', () => {
    expect(isGuideVpoSlug('guiav1')).toBe(true);
    expect(getPublicCourseTitle({ slug: 'guiav1', title: 'guiav1' })).toBe(GUIDE_VPO_TITLE);
    expect(getPublicCourseTitle({ slug: 'otro', title: 'Otro curso' })).toBe('Otro curso');
    expect(GUIDE_VPO_CHECKOUT_HREF).toBe('/cursos/guiav1#pagar');
  });

  it('sells process and preparation, not a personal story or 1:1 help', () => {
    const description = getPublicCourseDescription({ slug: 'guiav1' });
    expect(description).toMatch(/inscripción|llaves|sistema|papeles/i);
    expect(publicCopy).not.toMatch(/Carlos|Horta|Cómo conseguir una vivienda/i);
    expect(GUIDE_VPO_NOT_INCLUDED.join(' ')).toMatch(/acompañamiento 1:1/);
  });

  it('lists the guide themes aligned with the 2026 guide', () => {
    expect(GUIDE_VPO_CHAPTERS.length).toBeGreaterThanOrEqual(12);
    expect(GUIDE_VPO_CHAPTERS.map((chapter) => chapter.title).join(' ')).toMatch(/Registro/i);
    expect(GUIDE_VPO_CHAPTERS.map((chapter) => chapter.title).join(' ')).toMatch(/ICF|Carpeta|precio/i);
    expect(GUIDE_VPO_CHAPTERS.every((chapter) => chapter.hook.length > 12)).toBe(true);
    expect(GUIDE_VPO_OUTCOMES.length).toBeGreaterThanOrEqual(4);
    expect(GUIDE_VPO_INCLUDES.length).toBeGreaterThanOrEqual(6);
  });
});
