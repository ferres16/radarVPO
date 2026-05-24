import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfOcrService {
  private readonly logger = new Logger(PdfOcrService.name);

  normalizeDocumentUrl(rawUrl: string) {
    const trimmed = rawUrl.trim();
    if (!trimmed) return trimmed;

    const chromeWrapped = trimmed.match(/chrome-extension:\/\/.+?(https?:\/\/.+)$/i);
    if (chromeWrapped?.[1]) return chromeWrapped[1];

    const viewSource = trimmed.match(/^view-source:(https?:\/\/.+)$/i);
    if (viewSource?.[1]) return viewSource[1];

    return trimmed;
  }
}
