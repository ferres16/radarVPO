import { PdfOcrService } from '../src/jobs/pdf-ocr.service';

describe('PdfOcrService normalizeDocumentUrl', () => {
  const service = new PdfOcrService();

  it('unwraps chrome-extension PDF viewer URLs', () => {
    const url =
      'chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/https://www.registresolicitants.cat/files/File/NORMES%20DEL%20PROCEDIMENT%20HPC%20ESPAI%20LA%20SINIA%20SETBE.pdf';

    expect(service.normalizeDocumentUrl(url)).toBe(
      'https://www.registresolicitants.cat/files/File/NORMES%20DEL%20PROCEDIMENT%20HPC%20ESPAI%20LA%20SINIA%20SETBE.pdf',
    );
  });

  it('keeps regular URLs unchanged', () => {
    const url = 'https://example.org/promo.pdf';
    expect(service.normalizeDocumentUrl(url)).toBe(url);
  });
});
