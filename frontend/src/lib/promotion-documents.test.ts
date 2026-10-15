import { describe, expect, it } from 'vitest';
import type { PromotionDocument } from '@/types';
import {
  buildPdfFileName,
  buildPdfProxyPath,
  classifyDocument,
  clampPage,
  clampZoom,
  getViewableDocuments,
  isSafePdfUrl,
} from './promotion-documents';

function doc(overrides: Partial<PromotionDocument>): PromotionDocument {
  return {
    id: 'd1',
    documentKind: 'pdf_original',
    fileType: 'pdf',
    publicUrl: 'https://www.registresolicitants.cat/files/File/BASES%20Santa%20Susanna.pdf',
    ...overrides,
  };
}

describe('isSafePdfUrl', () => {
  it('accepts public https urls', () => {
    expect(isSafePdfUrl('https://www.registresolicitants.cat/files/File/a.pdf')).toBe(true);
  });

  it('rejects insecure, local and credentialed urls', () => {
    expect(isSafePdfUrl('http://www.registresolicitants.cat/a.pdf')).toBe(false);
    expect(isSafePdfUrl('https://localhost/a.pdf')).toBe(false);
    expect(isSafePdfUrl('https://127.0.0.1/a.pdf')).toBe(false);
    expect(isSafePdfUrl('https://169.254.169.254/latest')).toBe(false);
    expect(isSafePdfUrl('https://[::1]/a.pdf')).toBe(false);
    expect(isSafePdfUrl('https://intranet/a.pdf')).toBe(false);
    expect(isSafePdfUrl('https://db.internal/a.pdf')).toBe(false);
    expect(isSafePdfUrl('https://user:pass@example.cat/a.pdf')).toBe(false);
    expect(isSafePdfUrl('javascript:alert(1)')).toBe(false);
    expect(isSafePdfUrl('')).toBe(false);
    expect(isSafePdfUrl(null)).toBe(false);
  });
});

describe('classifyDocument', () => {
  it('detects document categories in Catalan and Spanish', () => {
    expect(classifyDocument('BASES ADJUDICACIO Santa Susanna DEF')).toBe('bases');
    expect(classifyDocument('Annex 1 sol·licitud')).toBe('annex');
    expect(classifyDocument('Anexo II declaración')).toBe('annex');
    expect(classifyDocument('Esmena de les bases')).toBe('amendment');
    expect(classifyDocument('Rectificación de errores')).toBe('amendment');
    expect(classifyDocument('Llistat provisional')).toBe('list');
    expect(classifyDocument('foto')).toBe('other');
  });
});

describe('getViewableDocuments', () => {
  it('keeps only public PDFs with safe urls and orders them by category', () => {
    const result = getViewableDocuments([
      doc({ id: 'annex', originalName: 'Annex%201.pdf', publicUrl: 'https://x.cat/annex.pdf' }),
      doc({ id: 'bases', originalName: 'BASES%20DEF.pdf', publicUrl: 'https://x.cat/bases.pdf' }),
      doc({ id: 'img', fileType: 'png', originalName: 'cartell.png', publicUrl: 'https://x.cat/c.png' }),
      doc({ id: 'private', isPublic: false, publicUrl: 'https://x.cat/p.pdf' }),
      doc({ id: 'unsafe', publicUrl: 'http://x.cat/u.pdf' }),
    ]);

    expect(result.map((item) => item.id)).toEqual(['bases', 'annex']);
    expect(result[0].label).toBe('BASES DEF');
    expect(result[0].category).toBe('bases');
  });

  it('returns an empty list when there is nothing to show', () => {
    expect(getViewableDocuments(undefined)).toEqual([]);
    expect(getViewableDocuments([])).toEqual([]);
  });
});

describe('viewer helpers', () => {
  it('builds the proxy path with encoded ids', () => {
    expect(buildPdfProxyPath('abc', 'd/1')).toBe('/api/promotion-pdf/abc/d%2F1');
    expect(buildPdfProxyPath('abc', 'd1', { download: true })).toBe(
      '/api/promotion-pdf/abc/d1?download=1',
    );
  });

  it('clamps zoom and pages', () => {
    expect(clampZoom(10)).toBe(3);
    expect(clampZoom(0.1)).toBe(0.5);
    expect(clampZoom(Number.NaN)).toBe(1);
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(3.7, 5)).toBe(3);
    expect(clampPage(2, 0)).toBe(1);
  });

  it('builds safe download names', () => {
    expect(buildPdfFileName('Bases: Santa/Susanna')).toBe('Bases Santa Susanna.pdf');
    expect(buildPdfFileName('')).toBe('documento.pdf');
    expect(buildPdfFileName('a.PDF')).toBe('a.PDF');
  });
});
