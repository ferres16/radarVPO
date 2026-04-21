import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai/ai.provider.service';
import { PdfOcrService } from './pdf-ocr.service';
import {
  ContactSection,
  DateItem,
  FeeItem,
  HybridPipelineOptions,
  PageExtraction,
  PromotionCoreData,
  PromotionPdfAnalysisResult,
  PromotionUnitRow,
  RequirementItem,
  SectionEvidence,
  TableResult,
} from './promotion-pdf-analysis.types';

type JsonRecord = Record<string, unknown>;

type RenderedPage = {
  page: number;
  imageBase64Png: string | null;
  nativeText: string;
};

@Injectable()
export class PromotionPdfHybridPipelineService {
  private readonly logger = new Logger(PromotionPdfHybridPipelineService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly pdfOcrService: PdfOcrService,
  ) {}

  async analyzePromotionPdf(input: {
    sourceUrl: string;
    pdfUrl: string;
    seedText?: string;
    options?: HybridPipelineOptions;
  }): Promise<PromotionPdfAnalysisResult> {
    const resource = await this.pdfOcrService.fetchDocumentResource(input.pdfUrl);
    const buffer = resource.buffer;
    const resolvedPdfUrl = resource.resolvedUrl;
    const renderedPages = await this.renderPages(buffer);
    const options = input.options ?? {};
    const reliabilityMode = options.preferReliability !== false;
    const minNativeCharsPerPage =
      options.minNativeCharsPerPage ?? (reliabilityMode ? 320 : 220);
    const maxPagesForVision =
      options.maxPagesForVision ?? (reliabilityMode ? 28 : 12);

    const pageExtractions: PageExtraction[] = [];

    for (const page of renderedPages) {
      const shouldRunOcr =
        page.nativeText.length < minNativeCharsPerPage ||
        this.looksLikeTablePage(page.nativeText);

      const ocrText =
        shouldRunOcr && page.imageBase64Png
          ? await this.runOcrSpaceOnImage(page.imageBase64Png, true)
          : null;

      const shouldRunVision =
        page.page <= maxPagesForVision && Boolean(page.imageBase64Png);
      const visionSummary =
        shouldRunVision && page.imageBase64Png
          ? await this.extractPageWithVision(page.imageBase64Png, page.page)
          : null;

      pageExtractions.push({
        page: page.page,
        nativeText: this.normalizeText(page.nativeText),
        ocrText: this.normalizeText(ocrText ?? ''),
        renderedImageBase64Png: page.imageBase64Png,
        visionSummary,
      });
    }

    const nativeCorpus = this.normalizeText(
      pageExtractions.map((item) => item.nativeText).join('\n\n'),
    );
    const ocrCorpus = this.normalizeText(
      pageExtractions.map((item) => item.ocrText ?? '').join('\n\n'),
    );
    const visionCorpus = this.normalizeText(
      pageExtractions
        .map((item) => {
          if (!item.visionSummary) {
            return '';
          }
          return JSON.stringify(item.visionSummary);
        })
        .join('\n\n'),
    );

    const mergedCorpus = this.normalizeText(
      [input.seedText ?? '', nativeCorpus, ocrCorpus, visionCorpus]
        .filter(Boolean)
        .join('\n\n'),
    );

    const tableResult = await this.extractTableWithThreeLevels({
      nativeCorpus,
      ocrCorpus,
      pageExtractions,
      sourceUrl: input.sourceUrl,
    });

    const aiSections = await this.extractSectionsWithAi({
      sourceUrl: input.sourceUrl,
      pdfUrl: resolvedPdfUrl,
      mergedCorpus,
      tableResult,
    });

    const languageDetected = this.detectLanguages(mergedCorpus);
    return this.buildFinalPayload({
      sourceUrl: input.sourceUrl,
      pdfUrl: resolvedPdfUrl,
      pageCount: renderedPages.length,
      tableResult,
      aiSections,
      pageExtractions,
      languageDetected,
      usedNativeText: nativeCorpus.length > 0,
      usedOcr: ocrCorpus.length > 0,
      usedVision: visionCorpus.length > 0,
    });
  }

  private async extractTableWithThreeLevels(input: {
    nativeCorpus: string;
    ocrCorpus: string;
    pageExtractions: PageExtraction[];
    sourceUrl: string;
  }): Promise<TableResult & { strategyLevel: 1 | 2 | 3 }> {
    const level1Rows = this.parseTableRowsFromText(input.nativeCorpus);
    if (level1Rows.length > 0) {
      const assessment = this.assessTableRows(level1Rows);
      return {
        ...assessment,
        strategyLevel: 1,
      };
    }

    const level2Rows = this.parseTableRowsFromText(input.ocrCorpus);
    if (level2Rows.length > 0) {
      const assessment = this.assessTableRows(level2Rows);
      return {
        ...assessment,
        strategyLevel: 2,
      };
    }

    const level2AiRows = await this.extractTableRowsWithAiText(
      input.sourceUrl,
      input.ocrCorpus,
    );
    if (level2AiRows.length > 0) {
      const assessment = this.assessTableRows(level2AiRows);
      return {
        ...assessment,
        strategyLevel: 2,
      };
    }

    const level3Rows = this.parseTableRowsFromVision(input.pageExtractions);
    if (level3Rows.length > 0) {
      const assessment = this.assessTableRows(level3Rows);
      return {
        ...assessment,
        strategyLevel: 3,
      };
    }

    return {
      status: 'error',
      confidence: 'low',
      rows: [],
      error_reason:
        'No se pudo reconstruir la tabla de viviendas con texto nativo, OCR ni vision.',
      missing_columns: [
        'floor',
        'door',
        'bedrooms',
        'useful_area_m2',
        'monthly_rent_eur',
      ],
      strategyLevel: 3,
    };
  }

  private async extractSectionsWithAi(input: {
    sourceUrl: string;
    pdfUrl: string;
    mergedCorpus: string;
    tableResult: TableResult;
  }): Promise<JsonRecord | null> {
    const completion = await this.aiProvider
      .complete({
        systemPrompt: [
          'Eres un extractor robusto para promociones VPO/HPO (castellano/catalan).',
          'Reglas obligatorias:',
          '- Salida SOLO JSON valido',
          '- No inventar datos: si no hay certeza, null',
          '- Fechas en YYYY-MM-DD cuando exista precision suficiente',
          '- Mantener separadas secciones promotion_data, requirements, dates, contact, fees_or_reservations',
          '- Repetir ambiguedades en ambiguous_fields',
          '- Si no hay evidencia fuerte, dejar null',
        ].join('\n'),
        userInput: JSON.stringify({
          source_url: input.sourceUrl,
          pdf_url: input.pdfUrl,
          text: input.mergedCorpus.slice(0, 70000),
          table_pre_extracted: input.tableResult,
        }),
        temperature: 0,
        maxTokens: 2800,
      })
      .catch((error) => {
        this.logger.warn(
          `AI section extraction failed: ${error instanceof Error ? error.message : 'unknown'}`,
        );
        return null;
      });

    if (!completion) {
      return null;
    }

    return this.safeJsonParse(completion.outputText);
  }

  private buildFinalPayload(input: {
    sourceUrl: string;
    pdfUrl: string;
    pageCount: number;
    tableResult: TableResult & { strategyLevel: 1 | 2 | 3 };
    aiSections: JsonRecord | null;
    pageExtractions: PageExtraction[];
    languageDetected: Array<'es' | 'ca'>;
    usedNativeText: boolean;
    usedOcr: boolean;
    usedVision: boolean;
  }): PromotionPdfAnalysisResult {
    const ai = input.aiSections ?? {};
    const promotionData = this.normalizePromotionData(ai, input.sourceUrl, input.pdfUrl);
    const requirements = this.normalizeRequirements(ai);
    const dates = this.normalizeDates(ai);
    const contact = this.normalizeContact(ai);
    const fees = this.normalizeFees(ai);

    const promotionEvidence = this.pickEvidenceForKeywords(input.pageExtractions, [
      'promocio',
      'promocion',
      'vpo',
      'hpo',
      'ubicacio',
      'ubicacion',
    ]);
    const requirementsEvidence = this.pickEvidenceForKeywords(input.pageExtractions, [
      'requisits',
      'requisitos',
      'ingressos',
      'ingresos',
      'empadron',
      'empadronament',
    ]);
    const datesEvidence = this.pickEvidenceForKeywords(input.pageExtractions, [
      'termini',
      'plazo',
      'data',
      'fecha',
      'inscripcio',
      'inscripcion',
    ]);
    const contactEvidence = this.pickEvidenceForKeywords(input.pageExtractions, [
      'telefon',
      'telefono',
      'email',
      'contacte',
      'promotor',
    ]);
    const feesEvidence = this.pickEvidenceForKeywords(input.pageExtractions, [
      'quota',
      'cuota',
      'reserva',
      'fianza',
      'eur',
      '€',
    ]);
    const tableEvidence = this.pickEvidenceForKeywords(input.pageExtractions, [
      'planta',
      'porta',
      'm2',
      'lloguer',
      'alquiler',
      'ocupacio',
      'ocupacion',
    ]);

    const missingFields = this.computeMissingFields({
      promotionData,
      contact,
      dates,
      requirements,
      fees,
      units: input.tableResult,
    });

    const ambiguousFields = this.extractStringList(ai.ambiguous_fields);
    const sectionScores = [
      this.computeSectionConfidence(promotionData, promotionEvidence),
      this.computeSectionConfidence(requirements, requirementsEvidence),
      this.computeSectionConfidence(dates, datesEvidence),
      this.computeSectionConfidence(contact, contactEvidence),
      this.confidenceFromLevel(input.tableResult.confidence),
      this.computeSectionConfidence(fees, feesEvidence),
    ];

    const confidenceScore =
      Math.round(
        (sectionScores.reduce((acc, n) => acc + n, 0) /
          sectionScores.length) *
          100,
      ) / 100;

    const warnings: string[] = [];
    if (input.tableResult.status !== 'complete') {
      warnings.push(
        input.tableResult.status === 'partial'
          ? 'Tabla de viviendas parcial; se devuelven solo filas confiables.'
          : `Tabla de viviendas no extraida: ${input.tableResult.error_reason ?? 'sin detalle'}`,
      );
    }

    return {
      promotion_data: {
        value: promotionData,
        confidence_score: this.computeSectionConfidence(
          promotionData,
          promotionEvidence,
        ),
        source_evidence: promotionEvidence,
      },
      requirements: {
        value: requirements,
        confidence_score: this.computeSectionConfidence(
          requirements,
          requirementsEvidence,
        ),
        source_evidence: requirementsEvidence,
      },
      dates: {
        value: dates,
        confidence_score: this.computeSectionConfidence(dates, datesEvidence),
        source_evidence: datesEvidence,
      },
      contact: {
        value: contact,
        confidence_score: this.computeSectionConfidence(contact, contactEvidence),
        source_evidence: contactEvidence,
      },
      units: {
        value: input.tableResult,
        confidence_score: this.confidenceFromLevel(input.tableResult.confidence),
        source_evidence: tableEvidence,
      },
      fees_or_reservations: {
        value: fees,
        confidence_score: this.computeSectionConfidence(fees, feesEvidence),
        source_evidence: feesEvidence,
      },
      confidence_score: confidenceScore,
      missing_fields: missingFields,
      ambiguous_fields: ambiguousFields,
      warnings,
      processing_meta: {
        language_detected: input.languageDetected,
        page_count: input.pageCount,
        strategy: {
          used_native_text: input.usedNativeText,
          used_ocr: input.usedOcr,
          used_vision: input.usedVision,
          table_strategy_level: input.tableResult.strategyLevel,
        },
      },
    };
  }

  private normalizePromotionData(
    ai: JsonRecord,
    sourceUrl: string,
    pdfUrl: string,
  ): PromotionCoreData {
    const section = this.asRecord(ai.promotion_data);

    return {
      source_url: this.asString(section.source_url) ?? sourceUrl,
      pdf_url: this.asString(section.pdf_url) ?? pdfUrl,
      title: this.asString(section.title),
      location: this.asString(section.location),
      municipality: this.asString(section.municipality),
      province: this.asString(section.province),
      autonomous_community: this.asString(section.autonomous_community),
      summary: this.asString(section.summary),
      promotion_type: this.asString(section.promotion_type),
      status: this.asString(section.status),
      tenure_type: this.asString(section.tenure_type),
    };
  }

  private normalizeRequirements(ai: JsonRecord): RequirementItem[] {
    const section = Array.isArray(ai.requirements) ? ai.requirements : [];

    return section
      .map((item, index) => {
        const row = this.asRecord(item);
        const description = this.asString(row.description);
        if (!description) {
          return null;
        }

        return {
          code: this.asString(row.code) ?? `req_${index + 1}`,
          description,
          value: this.asString(row.value),
        } satisfies RequirementItem;
      })
      .filter((item): item is RequirementItem => item !== null);
  }

  private normalizeDates(ai: JsonRecord): DateItem[] {
    const section = Array.isArray(ai.dates) ? ai.dates : [];

    return section
      .map((item) => {
        const row = this.asRecord(item);
        const label = this.asString(row.label);
        if (!label) {
          return null;
        }

        return {
          label,
          date: this.asDateString(row.date),
          notes: this.asString(row.notes),
        } satisfies DateItem;
      })
      .filter((item): item is DateItem => item !== null);
  }

  private normalizeContact(ai: JsonRecord): ContactSection {
    const section = this.asRecord(ai.contact);

    return {
      promoter_name: this.asString(section.promoter_name),
      promoter_tax_id: this.asString(section.promoter_tax_id),
      phone: this.asString(section.phone),
      email: this.asString(section.email),
      website: this.asString(section.website),
      office_address: this.asString(section.office_address),
    };
  }

  private normalizeFees(ai: JsonRecord): FeeItem[] {
    const section = Array.isArray(ai.fees_or_reservations)
      ? ai.fees_or_reservations
      : [];

    return section
      .map((item) => {
        const row = this.asRecord(item);
        const concept = this.asString(row.concept);
        if (!concept) {
          return null;
        }

        return {
          concept,
          amount_eur: this.asNumber(row.amount_eur),
          notes: this.asString(row.notes),
        } satisfies FeeItem;
      })
      .filter((item): item is FeeItem => item !== null);
  }

  private parseTableRowsFromVision(
    pageExtractions: PageExtraction[],
  ): PromotionUnitRow[] {
    const rows: PromotionUnitRow[] = [];

    for (const page of pageExtractions) {
      const vision = this.asRecord(page.visionSummary);
      const tableRows = Array.isArray(vision.table_rows) ? vision.table_rows : [];
      for (const item of tableRows) {
        rows.push(this.mapToUnitRow(this.asRecord(item)));
      }
    }

    return this.filterUsefulRows(rows);
  }

  private parseTableRowsFromText(text: string): PromotionUnitRow[] {
    if (!text) {
      return [];
    }

    const rows: PromotionUnitRow[] = [];
    const regex =
      /\b(BX|\d{1,2})\s+(\d{1,2})\s+(\d{1,3}[,.]\d{1,2})\s+(\d{1,2})\s+(-|\d{1,2})\s+(-|\d{1,2})\s+(-|\d{1,2})\s+(\d{1,2})\s+(\d{1,4}[,.]\d{1,2})\s*€?/gi;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      rows.push({
        id: `${match[1]}-${match[2]}`,
        label: null,
        homes: null,
        floor: match[1],
        door: match[2],
        bedrooms: this.toInt(match[4]),
        useful_area_m2: this.toDecimal(match[3]),
        built_area_m2: null,
        max_occupancy: this.toInt(match[8]),
        monthly_rent_eur: this.toDecimal(match[9]),
        sale_price_eur: null,
        reservation_eur: null,
        tenure: null,
        accessibility: null,
      });
    }

    if (rows.length === 0) {
      const countMatch = text.match(/(\d{1,4})\s+(habitatges|viviendas|vivendes|vivienda)/i);
      if (countMatch) {
        const homes = this.toInt(countMatch[1]);
        rows.push({
          id: null,
          label: 'total_homes',
          homes,
          floor: null,
          door: null,
          bedrooms: null,
          useful_area_m2: null,
          built_area_m2: null,
          max_occupancy: null,
          monthly_rent_eur: null,
          sale_price_eur: null,
          reservation_eur: null,
          tenure: null,
          accessibility: null,
        });
      }
    }

    return this.filterUsefulRows(rows);
  }

  private async extractTableRowsWithAiText(
    sourceUrl: string,
    ocrCorpus: string,
  ): Promise<PromotionUnitRow[]> {
    if (!ocrCorpus || ocrCorpus.length < 100) {
      return [];
    }

    const completion = await this.aiProvider
      .complete({
        systemPrompt:
          'Extrae filas de tabla de viviendas VPO/HPO desde OCR en JSON. Debes soportar tablas de alquiler y venta. No inventes. Si un valor no aparece, null. Si solo aparece un total, devuelve una fila resumida con label y homes.',
        userInput: JSON.stringify({
          source_url: sourceUrl,
          text: ocrCorpus.slice(0, 60000),
          output_schema: {
            table_rows: [
              {
                id: null,
                label: null,
                homes: null,
                floor: null,
                door: null,
                bedrooms: null,
                useful_area_m2: null,
                built_area_m2: null,
                monthly_rent_eur: null,
                sale_price_eur: null,
                reservation_eur: null,
                tenure: null,
                max_occupancy: null,
                accessibility: null,
              },
            ],
          },
        }),
        temperature: 0,
        maxTokens: 2200,
      })
      .catch(() => null);

    if (!completion) {
      return [];
    }

    const parsed = this.safeJsonParse(completion.outputText);
    if (!parsed) {
      return [];
    }

    const rows = Array.isArray(parsed.table_rows) ? parsed.table_rows : [];
    const mapped = rows.map((item) => this.mapToUnitRow(this.asRecord(item)));
    return this.filterUsefulRows(mapped);
  }

  private assessTableRows(rows: PromotionUnitRow[]): TableResult {
    const requiredColumns: Array<keyof PromotionUnitRow> = [
      'floor',
      'door',
      'bedrooms',
      'useful_area_m2',
      'monthly_rent_eur',
    ];

    const missingColumns = requiredColumns.filter((key) =>
      rows.every((row) => row[key] === null || row[key] === ''),
    );

    const status =
      missingColumns.length === 0
        ? 'complete'
        : rows.length > 0
          ? 'partial'
          : 'error';

    return {
      status,
      confidence: status === 'complete' ? 'high' : status === 'partial' ? 'medium' : 'low',
      rows,
      error_reason:
        status === 'error' ? 'No hay filas validas para la tabla de viviendas.' : null,
      missing_columns: missingColumns.map((key) => String(key)),
    };
  }

  private mapToUnitRow(row: JsonRecord): PromotionUnitRow {
    return {
      id: this.asString(row.id),
      label:
        this.asString(row.label) ??
        this.asString(row.tipologia) ??
        this.asString(row.vivienda) ??
        this.asString(row.habitatge),
      homes:
        this.asNumber(row.homes) ??
        this.asNumber(row.total_homes) ??
        this.asNumber(row.viviendas),
      floor: this.asString(row.floor) ?? this.asString(row.planta),
      door: this.asString(row.door) ?? this.asString(row.porta),
      bedrooms:
        this.asNumber(row.bedrooms) ??
        this.asNumber(row.numero_habitaciones) ??
        this.asNumber(row.dormitorios) ??
        this.asNumber(row.habitacions),
      useful_area_m2:
        this.asNumber(row.useful_area_m2) ??
        this.asNumber(row.m2_computables) ??
        this.asNumber(row.superficie_util_m2) ??
        this.asNumber(row.superficie_util),
      built_area_m2:
        this.asNumber(row.built_area_m2) ??
        this.asNumber(row.superficie_construida_m2),
      max_occupancy: this.asNumber(row.max_occupancy),
      monthly_rent_eur:
        this.asNumber(row.monthly_rent_eur) ??
        this.asNumber(row.precio_alquiler_mensual),
      sale_price_eur:
        this.asNumber(row.sale_price_eur) ??
        this.asNumber(row.precio_venta_eur) ??
        this.asNumber(row.precio_venta) ??
        this.asNumber(row.preu_venda),
      reservation_eur: this.asNumber(row.reservation_eur),
      tenure: this.asString(row.tenure),
      accessibility: this.asString(row.accessibility),
    };
  }

  private filterUsefulRows(rows: PromotionUnitRow[]): PromotionUnitRow[] {
    return rows.filter((row) => {
      const contentCount = [
        row.label,
        row.homes,
        row.floor,
        row.door,
        row.bedrooms,
        row.useful_area_m2,
        row.sale_price_eur,
        row.monthly_rent_eur,
      ].filter((value) => value !== null && value !== '').length;

      return contentCount >= 2;
    });
  }

  private async renderPages(buffer: Buffer): Promise<RenderedPage[]> {
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const canvasModule = await import('@napi-rs/canvas');
      const createCanvas = canvasModule.createCanvas;

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const pages: RenderedPage[] = [];

      for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
        const page = await pdf.getPage(pageIndex);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = createCanvas(
          Math.max(1, Math.floor(viewport.width)),
          Math.max(1, Math.floor(viewport.height)),
        );
        const context = canvas.getContext('2d');

        await page.render({
          canvas: canvas as unknown as HTMLCanvasElement,
          canvasContext: context as unknown as CanvasRenderingContext2D,
          viewport,
        }).promise;

        const bufferPng = canvas.toBuffer('image/png');
        const textContent = await page.getTextContent();
        const nativeText = (textContent.items as Array<Record<string, unknown>>)
          .map((item) => this.asString(item.str) ?? '')
          .join(' ');

        pages.push({
          page: pageIndex,
          imageBase64Png: bufferPng.toString('base64'),
          nativeText: this.normalizeText(nativeText),
        });
      }

      return pages;
    } catch (error) {
      this.logger.warn(
        `PDF page rendering failed, fallback to text-only parse: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return [];
    }
  }

  private looksLikeTablePage(text: string): boolean {
    if (!text) {
      return true;
    }

    return /(planta|porta|m2|m²|lloguer|alquiler|ocupaci[oó]n|habitaci[oó]n)/i.test(
      text,
    );
  }

  private async runOcrSpaceOnImage(
    imageBase64Png: string,
    isTable: boolean,
  ): Promise<string | null> {
    const apiKey = process.env.OCRSPACE_API_KEY;
    if (!apiKey) {
      return null;
    }

    const form = new FormData();
    form.append('base64Image', `data:image/png;base64,${imageBase64Png}`);
    form.append('language', process.env.OCRSPACE_LANGUAGE ?? 'spa');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    if (isTable) {
      form.append('isTable', 'true');
      form.append('OCREngine', '2');
      form.append('scale', 'true');
    }

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: apiKey,
      },
      body: form,
    }).catch(() => null);

    if (!response?.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      ParsedResults?: Array<{ ParsedText?: string }>;
    };

    const text = payload.ParsedResults?.map((it) => it.ParsedText ?? '').join(
      '\n',
    );
    return text ? this.normalizeText(text) : null;
  }

  private async extractPageWithVision(
    imageBase64Png: string,
    page: number,
  ): Promise<JsonRecord | null> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
    if (!apiKey) {
      return null;
    }

    const model = process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_output_tokens: 2000,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: [
                  'Extrae datos de una pagina de PDF de promocion VPO/HPO en JSON estricto.',
                  'No inventes. Usa null cuando no sea seguro.',
                  'Salida: {location,summary,dates,requisitos,table_rows,promoter,promotion_type,status,ambiguous_fields,confidence}.',
                ].join(' '),
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Analiza visualmente la pagina ${page}.`,
              },
              {
                type: 'input_image',
                image_url: `data:image/png;base64,${imageBase64Png}`,
              },
            ],
          },
        ],
      }),
    }).catch(() => null);

    if (!response?.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonRecord;
    const outputText = this.resolveResponseOutputText(payload);

    if (!outputText) {
      return null;
    }

    return this.safeJsonParse(outputText);
  }

  private pickEvidenceForKeywords(
    pages: PageExtraction[],
    keywords: string[],
  ): SectionEvidence[] {
    const result: SectionEvidence[] = [];

    for (const page of pages) {
      const lowerNative = page.nativeText.toLowerCase();
      const lowerOcr = (page.ocrText ?? '').toLowerCase();
      const hit = keywords.some(
        (keyword) => lowerNative.includes(keyword) || lowerOcr.includes(keyword),
      );

      if (!hit) {
        continue;
      }

      const nativeSnippet = page.nativeText.slice(0, 220);
      if (nativeSnippet) {
        result.push({
          source: 'native_text',
          page: page.page,
          snippet: nativeSnippet,
        });
      }

      const ocrSnippet = (page.ocrText ?? '').slice(0, 220);
      if (ocrSnippet) {
        result.push({
          source: 'ocr',
          page: page.page,
          snippet: ocrSnippet,
        });
      }

      if (page.visionSummary) {
        result.push({
          source: 'vision',
          page: page.page,
          snippet: JSON.stringify(page.visionSummary).slice(0, 220),
        });
      }

      if (result.length >= 6) {
        break;
      }
    }

    return result;
  }

  private computeMissingFields(input: {
    promotionData: PromotionCoreData;
    contact: ContactSection;
    dates: DateItem[];
    requirements: RequirementItem[];
    fees: FeeItem[];
    units: TableResult;
  }): string[] {
    const missing: string[] = [];

    const coreChecks: Array<[string, unknown]> = [
      ['promotion_data.title', input.promotionData.title],
      ['promotion_data.location', input.promotionData.location],
      ['promotion_data.summary', input.promotionData.summary],
      ['promotion_data.promotion_type', input.promotionData.promotion_type],
      ['promotion_data.status', input.promotionData.status],
      ['contact.promoter_name', input.contact.promoter_name],
    ];

    for (const [field, value] of coreChecks) {
      if (value === null || value === undefined || value === '') {
        missing.push(field);
      }
    }

    if (input.dates.length === 0) {
      missing.push('dates');
    }
    if (input.requirements.length === 0) {
      missing.push('requirements');
    }
    if (input.fees.length === 0) {
      missing.push('fees_or_reservations');
    }
    if (input.units.rows.length === 0) {
      missing.push('units.rows');
    }

    return missing;
  }

  private computeSectionConfidence(value: unknown, evidence: SectionEvidence[]): number {
    const evidenceBoost = evidence.length > 0 ? 0.2 : 0;

    const hasValues = this.countNonNullLeaves(value) > 0;
    const base = hasValues ? 0.55 : 0.25;
    return Math.min(1, Math.round((base + evidenceBoost) * 100) / 100);
  }

  private countNonNullLeaves(value: unknown): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (Array.isArray(value)) {
      return value.reduce((acc, item) => acc + this.countNonNullLeaves(item), 0);
    }

    if (typeof value === 'object') {
      return Object.values(value as JsonRecord).reduce<number>(
        (acc, item) => acc + this.countNonNullLeaves(item),
        0,
      );
    }

    return 1;
  }

  private confidenceFromLevel(level: 'high' | 'medium' | 'low'): number {
    if (level === 'high') {
      return 0.9;
    }
    if (level === 'medium') {
      return 0.65;
    }
    return 0.35;
  }

  private detectLanguages(text: string): Array<'es' | 'ca'> {
    const lower = text.toLowerCase();
    const languages: Array<'es' | 'ca'> = [];

    if (/\b(vivienda|alquiler|requisitos|municipio|solicitud)\b/.test(lower)) {
      languages.push('es');
    }
    if (/\b(habitatge|lloguer|requisits|municipi|sol\u00b7licitud)\b/.test(lower)) {
      languages.push('ca');
    }

    return languages.length > 0 ? languages : ['es'];
  }

  private extractStringList(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  private safeJsonParse(text: string): JsonRecord | null {
    const normalized = text.trim();
    const fenceMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenceMatch ? fenceMatch[1].trim() : normalized;

    try {
      return JSON.parse(candidate) as JsonRecord;
    } catch {
      const firstBrace = candidate.indexOf('{');
      const lastBrace = candidate.lastIndexOf('}');
      if (firstBrace < 0 || lastBrace <= firstBrace) {
        return null;
      }

      try {
        return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as JsonRecord;
      } catch {
        return null;
      }
    }
  }

  private resolveResponseOutputText(payload: JsonRecord): string | null {
    const firstChoice = this.asRecord(
      Array.isArray(payload.output) ? payload.output[0] : null,
    );
    const content = Array.isArray(firstChoice.content)
      ? (firstChoice.content as unknown[])
      : [];

    const textChunk = content
      .map((item) => this.asRecord(item))
      .find((item) => this.asString(item.type) === 'output_text');

    return (
      this.asString(payload.output_text) ??
      this.asString(textChunk?.text) ??
      this.asString(firstChoice.text)
    );
  }

  private asRecord(value: unknown): JsonRecord {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as JsonRecord;
    }
    return {};
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' ? value.trim() || null : null;
  }

  private asDateString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString().slice(0, 10);
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const normalized = value
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '')
        .trim();
      if (!normalized) {
        return null;
      }

      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toInt(value: string): number | null {
    const parsed = Number(value.trim());
    return Number.isInteger(parsed) ? parsed : null;
  }

  private toDecimal(value: string): number | null {
    const parsed = Number(value.replace(/\./g, '').replace(',', '.').trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

}
