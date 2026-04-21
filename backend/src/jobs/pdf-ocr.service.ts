import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { createHash } from 'crypto';
import PDFParser from 'pdf2json';
import * as cheerio from 'cheerio';

type PdfParsed = {
  text: string;
  numpages: number;
};

type ParseResult = {
  text: string;
  pageCount?: number;
  method: 'pdf-parse' | 'ocr-space' | 'none';
  resolvedUrl?: string;
  detectedMimeType?: string;
  discoveredViaHtml?: boolean;
};

type DocumentResource = {
  buffer: Buffer;
  resolvedUrl: string;
  mimeType: string;
  discoveredViaHtml: boolean;
};

@Injectable()
export class PdfOcrService {
  private readonly logger = new Logger(PdfOcrService.name);

  normalizeDocumentUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return trimmed;
    }

    // Chrome PDF viewer wrappers usually embed the real URL at the end.
    const chromeWrapped = trimmed.match(/chrome-extension:\/\/.+?(https?:\/\/.+)$/i);
    if (chromeWrapped?.[1]) {
      return chromeWrapped[1];
    }

    const viewSource = trimmed.match(/^view-source:(https?:\/\/.+)$/i);
    if (viewSource?.[1]) {
      return viewSource[1];
    }

    return trimmed;
  }

  async parseDocument(
    url: string,
    fileType?: string,
    options?: { preferTableOcr?: boolean },
  ): Promise<ParseResult> {
    const resource = await this.fetchDocumentResource(url);
    const { buffer, resolvedUrl, mimeType, discoveredViaHtml } = resource;
    const shouldParseAsPdf = this.isPdf(fileType, resolvedUrl, mimeType);

    if (shouldParseAsPdf) {
      const parsed = await this.parsePdf(buffer);
      const shouldFallbackToOcr = parsed.text.length < 500;
      const shouldEnrichWithOcr =
        !shouldFallbackToOcr && this.needsTableOcrEnrichment(parsed.text);
      const shouldPreferTableOcr = options?.preferTableOcr === true;

      if (shouldPreferTableOcr) {
        const tableOcrText = await this.runOcrSpace(
          buffer,
          'application/pdf',
          true,
        );
        if (tableOcrText) {
          const mergedPreferred = this.mergeExtractedTexts(
            parsed.text,
            tableOcrText,
          );
          return {
            text: mergedPreferred,
            pageCount: parsed.pageCount,
            method: 'ocr-space',
            resolvedUrl,
            detectedMimeType: mimeType,
            discoveredViaHtml,
          };
        }
      }

      if (shouldFallbackToOcr || shouldEnrichWithOcr) {
        const ocrText = await this.runOcrSpace(
          buffer,
          'application/pdf',
          shouldEnrichWithOcr,
        );
        if (ocrText) {
          if (shouldFallbackToOcr) {
            return {
              text: ocrText,
              method: 'ocr-space',
              resolvedUrl,
              detectedMimeType: mimeType,
              discoveredViaHtml,
            };
          }

          const merged = this.mergeExtractedTexts(parsed.text, ocrText);
          return {
            text: merged,
            pageCount: parsed.pageCount,
            method: 'ocr-space',
            resolvedUrl,
            detectedMimeType: mimeType,
            discoveredViaHtml,
          };
        }
      }

      return {
        ...parsed,
        resolvedUrl,
        detectedMimeType: mimeType,
        discoveredViaHtml,
      };
    }

    if (mimeType.includes('text/html')) {
      this.logger.warn(
        `Document URL did not resolve to a PDF/binary file: ${resolvedUrl}`,
      );
      return {
        text: '',
        method: 'none',
        resolvedUrl,
        detectedMimeType: mimeType,
        discoveredViaHtml,
      };
    }

    const ocr = await this.runOcrSpace(
      buffer,
      mimeType || fileType || 'application/octet-stream',
    );
    if (ocr) {
      return {
        text: ocr,
        method: 'ocr-space',
        resolvedUrl,
        detectedMimeType: mimeType,
        discoveredViaHtml,
      };
    }

    return {
      text: '',
      method: 'none',
      resolvedUrl,
      detectedMimeType: mimeType,
      discoveredViaHtml,
    };
  }

  async fetchDocumentResource(
    url: string,
    maxDepth = 3,
    viaHtml = false,
  ): Promise<DocumentResource> {
    const normalizedUrl = this.normalizeDocumentUrl(url);
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'RadarVPOBot/1.0 (+https://www.registresolicitants.cat/registre/)',
        Accept: 'application/pdf,text/html,application/xhtml+xml,image/*,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed downloading document (${response.status})`);
    }

    const resolvedUrl = this.normalizeDocumentUrl(response.url || normalizedUrl);
    const mimeType = this.normalizeMimeType(
      response.headers.get('content-type') ?? '',
    );
    const arr = await response.arrayBuffer();
    const buffer = Buffer.from(arr);

    if (this.isPdf(undefined, resolvedUrl, mimeType) || this.looksLikePdf(buffer)) {
      return {
        buffer,
        resolvedUrl,
        mimeType: mimeType || 'application/pdf',
        discoveredViaHtml: viaHtml,
      };
    }

    const looksHtml =
      mimeType.includes('text/html') || this.looksLikeHtmlDocument(buffer);

    if (looksHtml && maxDepth > 0) {
      const html = this.decodeHtml(buffer, response.headers.get('content-type'));
      const embeddedPdfUrl = this.extractEmbeddedPdfUrl(html, resolvedUrl);
      if (embeddedPdfUrl) {
        return this.fetchDocumentResource(embeddedPdfUrl, maxDepth - 1, true);
      }
    }

    return {
      buffer,
      resolvedUrl,
      mimeType: mimeType || 'application/octet-stream',
      discoveredViaHtml: viaHtml,
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
      const normalized = this.normalizeExtractedText(parsed.text || '');
      const structured = await this.parsePdfStructured(buffer);
      const merged = this.mergeExtractedTexts(normalized, structured);

      return {
        text: merged,
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

  private async parsePdfStructured(buffer: Buffer): Promise<string> {
    try {
      const payload = await new Promise<Record<string, unknown>>(
        (resolve, reject) => {
          const parser = new PDFParser();
          parser.on('pdfParser_dataError', (errMsg: unknown) => {
            if (
              typeof errMsg === 'object' &&
              errMsg !== null &&
              'parserError' in errMsg
            ) {
              reject((errMsg as { parserError?: unknown }).parserError);
              return;
            }

            reject(errMsg);
          });
          parser.on('pdfParser_dataReady', (data: unknown) =>
            resolve(data as Record<string, unknown>),
          );
          parser.parseBuffer(buffer);
        },
      );

      const pages = Array.isArray(payload.Pages)
        ? (payload.Pages as Array<Record<string, unknown>>)
        : [];

      const lines: string[] = [];

      for (const page of pages) {
        const texts = Array.isArray(page.Texts)
          ? (page.Texts as Array<Record<string, unknown>>)
          : [];
        const byLine = new Map<string, Array<{ x: number; text: string }>>();

        for (const item of texts) {
          const x = typeof item.x === 'number' ? item.x : Number(item.x ?? 0);
          const y = typeof item.y === 'number' ? item.y : Number(item.y ?? 0);
          const runs = Array.isArray(item.R)
            ? (item.R as Array<Record<string, unknown>>)
            : [];
          const raw = runs
            .map((run) => String(run.T ?? ''))
            .map((token) => {
              try {
                return decodeURIComponent(token);
              } catch {
                return token;
              }
            })
            .join('')
            .trim();

          if (!raw) {
            continue;
          }

          const lineKey = `${Math.round(y * 10) / 10}`;
          const bucket = byLine.get(lineKey) ?? [];
          bucket.push({ x, text: raw });
          byLine.set(lineKey, bucket);
        }

        const orderedKeys = [...byLine.keys()].sort(
          (a, b) => Number(a) - Number(b),
        );

        for (const key of orderedKeys) {
          const parts = (byLine.get(key) ?? [])
            .sort((a, b) => a.x - b.x)
            .map((entry) => entry.text);
          const line = parts.join(' ').replace(/\s{2,}/g, ' ').trim();
          if (line) {
            lines.push(line);
          }
        }
      }

      return this.normalizeExtractedText(lines.join('\n'));
    } catch (error) {
      this.logger.warn(
        `pdf2json failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return '';
    }
  }

  private async runOcrSpace(
    buffer: Buffer,
    mimeType: string,
    isTable = false,
  ): Promise<string | null> {
    const apiKey = process.env.OCRSPACE_API_KEY || 'helloworld';
    if (!apiKey) {
      return null;
    }

    const form = new FormData();
    form.append('language', process.env.OCRSPACE_LANGUAGE ?? 'spa');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    if (isTable) {
      form.append('isTable', 'true');
      form.append('OCREngine', '2');
      form.append('scale', 'true');
    }

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

  private isPdf(
    fileType: string | undefined,
    url: string,
    mimeType?: string,
  ): boolean {
    if (mimeType?.includes('application/pdf')) {
      return true;
    }

    if (fileType?.toLowerCase().includes('pdf')) {
      return true;
    }

    return url.toLowerCase().includes('.pdf');
  }

  private normalizeMimeType(contentType: string): string {
    return contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  }

  private looksLikePdf(buffer: Buffer): boolean {
    return buffer.subarray(0, 5).toString('utf8') === '%PDF-';
  }

  private looksLikeHtmlDocument(buffer: Buffer): boolean {
    const start = buffer
      .subarray(0, 512)
      .toString('utf8')
      .toLowerCase();
    return start.includes('<html') || start.includes('<!doctype html');
  }

  private decodeHtml(buffer: Buffer, contentType: string | null): string {
    const header = contentType ?? '';
    const charsetMatch = header.match(/charset=([^;]+)/i);
    const charset = charsetMatch?.[1]?.trim().toLowerCase() ?? 'utf-8';

    try {
      if (charset.includes('iso-8859-1') || charset.includes('latin1')) {
        return new TextDecoder('iso-8859-1').decode(buffer);
      }
      return new TextDecoder('utf-8').decode(buffer);
    } catch {
      return new TextDecoder('utf-8').decode(buffer);
    }
  }

  private extractEmbeddedPdfUrl(html: string, pageUrl: string): string | null {
    const $ = cheerio.load(html);
    const candidates: string[] = [];

    $('a, iframe, embed, object, area').each((_, el) => {
      const href =
        $(el).attr('href') ??
        $(el).attr('src') ??
        $(el).attr('data') ??
        '';
      const onclick = $(el).attr('onclick') ?? '';

      if (href) {
        candidates.push(href);
      }

      const matches = onclick.matchAll(
        /(['"])(https?:\/\/[^'"\s]+|\/[^'"\s]+)(\?.*?)?\1/gi,
      );
      for (const match of matches) {
        const token = `${match[2] ?? ''}${match[3] ?? ''}`;
        if (token) {
          candidates.push(token);
        }
      }
    });

    const scriptText = $('script').text();
    const scriptMatches = scriptText.matchAll(
      /(https?:\/\/[^\s'"`]+\.pdf[^\s'"`]*)|(\/[^\s'"`]+\.pdf[^\s'"`]*)/gi,
    );
    for (const match of scriptMatches) {
      const token = match[0];
      if (token) {
        candidates.push(token);
      }
    }

    const normalized = candidates
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => this.resolveUrl(pageUrl, token));

    const withPdfSignals = normalized.find((value) =>
      /\.pdf(\?|$)|[?&](format|tipo|type)=pdf|download/i.test(value),
    );

    return withPdfSignals ?? null;
  }

  private resolveUrl(baseUrl: string, value: string): string {
    try {
      return this.normalizeDocumentUrl(new URL(value, baseUrl).toString());
    } catch {
      return this.normalizeDocumentUrl(value);
    }
  }

  private async fetchAsBuffer(url: string): Promise<Buffer> {
    const resource = await this.fetchDocumentResource(url);
    return resource.buffer;
  }
}
