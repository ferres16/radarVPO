import { describe, expect, it } from 'vitest';
import {
  getNewsArticleUrl,
  getNewsNextStep,
  newsSourceLooksLikeHomepage,
} from './news-source';

describe('news source helpers', () => {
  it('prefers itemUrl over sourceUrl', () => {
    expect(
      getNewsArticleUrl({
        itemUrl: 'https://example.com/noticia/123',
        sourceUrl: 'https://example.com/',
      }),
    ).toBe('https://example.com/noticia/123');
  });

  it('detects homepage-looking sources', () => {
    expect(newsSourceLooksLikeHomepage('https://www.lavanguardia.com/')).toBe(true);
    expect(newsSourceLooksLikeHomepage('https://www.lavanguardia.com/economia/2026/01/vpo.html')).toBe(
      false,
    );
  });

  it('suggests a useful next step from the topic', () => {
    const step = getNewsNextStep({
      category: 'ayudas',
      topic: 'subvenciones',
      title: 'Nueva ayuda a la entrada',
    });
    expect(step.href).toBe('/cursos/guiav1');
  });
});
