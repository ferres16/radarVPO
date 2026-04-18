import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { createHash } from 'crypto';

type PdfParsed = {
  text: string;
  numpages: number;
};

type ParseResult = {
  text: string;
  pageCount?: number;
  method: 'pdf-parse' | 'ocr-space' | 'none';
};

@Injectable()
export class PdfOcrService {
  private readonly logger = new Logger(PdfOcrService.name);

  async parseDocument(url: string, fileType?: string): Promise<ParseResult> {
    const buffer = await this.fetchAsBuffer(url);

    if (this.isPdf(fileType, url)) {
      const parsed = await this.parsePdf(buffer);
      const shouldFallbackToOcr = parsed.text.length < 500;
      const shouldEnrichWithOcr =
        !shouldFallbackToOcr && this.needsTableOcrEnrichment(parsed.text);

      if (shouldFallbackToOcr || shouldEnrichWithOcr) {
        const ocrText = await this.runOcrSpace(buffer, 'application/pdf');
        if (ocrText) {
          if (shouldFallbackToOcr) {
            return {
              text: ocrText,
              method: 'ocr-space',
            };
          }

          const merged = this.mergeExtractedTexts(parsed.text, ocrText);
          return {
            text: merged,
            pageCount: parsed.pageCount,
            method: 'ocr-space',
          };
        }
      }

      return parsed;
    }

    const ocr = await this.runOcrSpace(
      buffer,
      fileType ?? 'application/octet-stream',
    );
    if (ocr) {
      return {
        text: ocr,
        method: 'ocr-space',
      };
    }

    return {
      text: '',
      method: 'none',
    };
  }

  normalizeExtractedText(text: string): string {
    return text
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  buildDocumentFingerprint(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  private needsTableOcrEnrichment(text: string): boolean {
    const normalized = text.toLowerCase();

    const hasHousingContext =
      /annex\s*1|annex\s*i|habitatges|viviendas|adjudicaci[oó]|lloguer/.test(
        normalized,
      );

    const hasTableSignals =
      /m[²2]\s*computables|lloguer\s+mensual|ocupaci[oó]\s+m[aà]xima|\bplanta\b\s+\bporta\b/.test(
        normalized,
      );

    return hasHousingContext && !hasTableSignals;
  }

  private mergeExtractedTexts(primary: string, secondary: string): string {
    const a = this.normalizeExtractedText(primary);
    const b = this.normalizeExtractedText(secondary);

    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    if (a.includes(b.slice(0, 200))) {
      return a;
    }
    if (b.includes(a.slice(0, 200))) {
      return b;
    }

    return this.normalizeExtractedText(`${a}\n\n${b}`);
  }

  private async parsePdf(buffer: Buffer): Promise<ParseResult> {
    try {
      const parsed = (await pdfParse(buffer)) as PdfParsed;
      return {
        text: this.normalizeExtractedText(parsed.text || ''),
        pageCount: parsed.numpages,
        method: 'pdf-parse',
      };
    } catch (error) {
      this.logger.warn(
        `pdf-parse failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return {
        text: '',
        method: 'none',
      };
    }
  }

  private async runOcrSpace(
    buffer: Buffer,
    mimeType: string,
  ): Promise<string | null> {
    const apiKey = process.env.OCRSPACE_API_KEY;
    if (!apiKey) {
      return null;
    }

    const form = new FormData();
    form.append('language', process.env.OCRSPACE_LANGUAGE ?? 'spa');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');

    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    form.append('file', blob, 'document');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: apiKey,
      },
      body: form,
    });

    if (!response.ok) {
      this.logger.warn(`OCR.Space failed with status ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as {
      ParsedResults?: Array<{ ParsedText?: string }>;
      IsErroredOnProcessing?: boolean;
      ErrorMessage?: string | string[];
    };

    if (payload.IsErroredOnProcessing) {
      this.logger.warn(
        `OCR.Space error: ${JSON.stringify(payload.ErrorMessage ?? 'unknown')}`,
      );
      return null;
    }

    const text = payload.ParsedResults?.map((it) => it.ParsedText ?? '').join(
      '\n',
    );
    return text ? this.normalizeExtractedText(text) : null;
  }

  private isPdf(fileType: string | undefined, url: string): boolean {
    if (fileType?.toLowerCase().includes('pdf')) {
      return true;
    }

    return url.toLowerCase().includes('.pdf');
  }

  private async fetchAsBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed downloading document (${response.status})`);
    }

    const arr = await response.arrayBuffer();
    return Buffer.from(arr);
  }
}
