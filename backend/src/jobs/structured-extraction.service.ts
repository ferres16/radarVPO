import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai/ai.provider.service';
import {
  HOUSING_TABLE_PROMPT,
  NEWS_ANALYSIS_PROMPT,
  VPO_EXTRACTION_PROMPT,
} from './ai-prompts';

@Injectable()
export class StructuredExtractionService {
  private readonly logger = new Logger(StructuredExtractionService.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async extractPromotionData(
    rawText: string,
    sourceUrl: string,
    pdfUrl?: string,
  ): Promise<{
    result: Record<string, unknown>;
    provider: string;
    model: string;
    confidence: number;
  }> {
    const fallback = this.buildPromotionFallback(rawText, sourceUrl);

    const completion = await this.aiProvider
      .complete({
        systemPrompt: VPO_EXTRACTION_PROMPT,
        userInput: `SOURCE_URL: ${sourceUrl}\n\nCONTENT:\n${rawText}`,
        temperature: 0,
        maxTokens: 2800,
      })
      .catch((error) => {
        this.logger.warn(
          `AI promotion extraction failed, using fallback: ${
            error instanceof Error ? error.message : 'unknown'
          }`,
        );
        return null;
      });

    if (!completion) {
      const enrichedFallback = this.enrichPromotionResult(
        fallback,
        rawText,
        sourceUrl,
      );
      const withHousingTable = await this.enrichWithHousingTable(
        enrichedFallback,
        rawText,
        sourceUrl,
        pdfUrl,
      );

      return {
        result: withHousingTable,
        provider: 'fallback',
        model: 'regex-heuristic',
        confidence: 0.35,
      };
    }

    const parsed = this.safeJsonParse(completion.outputText);
    if (!parsed) {
      const enrichedInvalid = this.enrichPromotionResult(
        {
          ...fallback,
          parsing_error: 'AI output was not valid JSON',
          raw_output: completion.outputText,
        },
        rawText,
        sourceUrl,
      );
      const withHousingTable = await this.enrichWithHousingTable(
        enrichedInvalid,
        rawText,
        sourceUrl,
        pdfUrl,
      );

      return {
        result: withHousingTable,
        provider: completion.provider,
        model: completion.model,
        confidence: 0.4,
      };
    }

    const enriched = this.enrichPromotionResult(parsed, rawText, sourceUrl);
    const withHousingTable = await this.enrichWithHousingTable(
      enriched,
      rawText,
      sourceUrl,
      pdfUrl,
    );

    return {
      result: withHousingTable,
      provider: completion.provider,
      model: completion.model,
      confidence: 0.8,
    };
  }

  private async enrichWithHousingTable(
    result: Record<string, unknown>,
    rawText: string,
    sourceUrl: string,
    pdfUrl?: string,
  ): Promise<Record<string, unknown>> {
    const units = this.asRecord(result.units);
    const existingRows = this.parseHousingTableRows(units.housing_table);
    if (existingRows.length > 0) {
      return result;
    }

    if (
      rawText.length < 1500 ||
      !/(planta|porta|m2|lloguer|alquiler|ocupaci[oó]n|habitaci[oó]n)/i.test(
        rawText,
      )
    ) {
      return result;
    }

    const completion = await this.aiProvider
      .complete({
        systemPrompt: HOUSING_TABLE_PROMPT,
        userInput: `SOURCE_URL: ${sourceUrl}\n\nCONTENT:\n${rawText}`,
        temperature: 0,
        maxTokens: 3200,
      })
      .catch((error) => {
        this.logger.warn(
          `AI housing table extraction failed: ${
            error instanceof Error ? error.message : 'unknown'
          }`,
        );
        return null;
      });

    if (!completion) {
      return result;
    }

    const parsed = this.safeJsonParse(completion.outputText);
    if (!parsed) {
      return result;
    }

    const rows = this.parseHousingTableRows(parsed.housing_table);
    let finalRows = rows;

    if (finalRows.length === 0 && pdfUrl) {
      const rowsFromPdf = await this.extractHousingTableFromPdfUrl(pdfUrl);
      if (rowsFromPdf.length > 0) {
        finalRows = rowsFromPdf;
      }
    }

    if (finalRows.length === 0) {
      return result;
    }

    units.housing_table = finalRows;

    const additional = this.asRecord(result.additional_extracted_data);
    additional.housing_table_source = `ai:${completion.provider}:${completion.model}`;

    return {
      ...result,
      units,
      additional_extracted_data: additional,
    };
  }

  async analyzeNewsItem(payload: {
    title: string;
    content: string;
    source: string;
    url: string;
    publishedAt: string;
  }): Promise<{
    classification: string;
    summary: string;
    relevance: string;
    provider: string;
    model: string;
  }> {
    const input = JSON.stringify(payload);
    const completion = await this.aiProvider
      .complete({
        systemPrompt: NEWS_ANALYSIS_PROMPT,
        userInput: input,
        temperature: 0.1,
        maxTokens: 1200,
      })
      .catch(() => null);

    if (!completion) {
      return {
        classification: 'unknown',
        summary: payload.content.slice(0, 240),
        relevance: 'low',
        provider: 'fallback',
        model: 'regex-heuristic',
      };
    }

    const parsed = this.safeJsonParse(completion.outputText) ?? {};
    const classification = this.asRecord(parsed.classification);
    const summary = this.asRecord(parsed.summary);

    const summaryText =
      this.asString(summary.short_summary) ?? payload.content.slice(0, 240);
    const relevance = this.asString(classification.relevance) ?? 'medium';

    return {
      classification: this.asString(parsed.classification) ?? 'unknown',
      summary: summaryText,
      relevance,
      provider: completion.provider,
      model: completion.model,
    };
  }

  private safeJsonParse(text: string): Record<string, unknown> | null {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      const candidate = text.match(/\{[\s\S]*\}$/)?.[0];
      if (!candidate) {
        return null;
      }

      try {
        return JSON.parse(candidate) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return {};
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number') {
      return value;
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
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  private parseHousingTableRows(value: unknown): Array<Record<string, unknown>> {
    if (!Array.isArray(value)) {
      return [];
    }

    const rows: Array<Record<string, unknown>> = [];

    for (const item of value) {
      const record = this.asRecord(item);
      const normalized: Record<string, unknown> = {};

      for (const [key, raw] of Object.entries(record)) {
        const safeKey = key
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '');

        if (!safeKey) {
          continue;
        }

        const maybeNumber = this.asNumber(raw);
        normalized[safeKey] = maybeNumber ?? this.asString(raw) ?? null;
      }

      const hasEnoughContent =
        Object.values(normalized).filter(
          (cell) => cell !== null && String(cell).trim() !== '',
        ).length >= 2;

      if (hasEnoughContent) {
        rows.push(normalized);
      }
    }

    return rows;
  }

  private async extractHousingTableFromPdfUrl(
    pdfUrl: string,
  ): Promise<Array<Record<string, unknown>>> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        return [];
      }

      const fileBuffer = Buffer.from(await response.arrayBuffer());
      const form = new FormData();
      form.append('purpose', 'user_data');
      form.append(
        'file',
        new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' }),
        'promotion.pdf',
      );

      const uploadRes = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      });

      if (!uploadRes.ok) {
        return [];
      }

      const uploaded = (await uploadRes.json()) as { id?: string };
      if (!uploaded.id) {
        return [];
      }

      const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const responsesRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_output_tokens: 3200,
          input: [
            {
              role: 'system',
              content: [{ type: 'input_text', text: HOUSING_TABLE_PROMPT }],
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_file',
                  file_id: uploaded.id,
                },
                {
                  type: 'input_text',
                  text: 'Devuelve la tabla completa de pisos en el JSON solicitado.',
                },
              ],
            },
          ],
        }),
      });

      if (!responsesRes.ok) {
        return [];
      }

      const payload = (await responsesRes.json()) as Record<string, unknown>;
      const outputArray = Array.isArray(payload.output)
        ? (payload.output as Array<Record<string, unknown>>)
        : [];
      const firstOutput = this.asRecord(outputArray[0]);
      const firstContentArray = Array.isArray(firstOutput.content)
        ? (firstOutput.content as Array<Record<string, unknown>>)
        : [];
      const firstContent = this.asRecord(firstContentArray[0]);
      const outputText =
        (payload.output_text as string | undefined) ??
        this.asString(firstContent.text);

      if (!outputText) {
        return [];
      }

      const parsed = this.safeJsonParse(outputText);
      if (!parsed) {
        return [];
      }

      const rows = this.parseHousingTableRows(parsed.housing_table);
      return rows;
    } catch (error) {
      this.logger.warn(
        `OpenAI PDF table extraction failed: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
      return [];
    }
  }

  private buildPromotionFallback(
    rawText: string,
    sourceUrl: string,
  ): Record<string, unknown> {
    const daysMatch = rawText.match(/en\s+(\d{1,3})\s+d[ií]as/i);
    const now = new Date();
    const estimatedPublicationDate = daysMatch
      ? new Date(now.getTime() + Number(daysMatch[1]) * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      : null;

    return {
      promotion: {
        source_url: sourceUrl,
        future_launch: Boolean(daysMatch),
        estimated_publication_date: estimatedPublicationDate,
      },
      units: {
        total_homes: this.extractHomesCount(rawText),
      },
      data_quality: {
        extraction_mode: 'fallback',
        ambiguous_fields: [],
      },
      raw_excerpt: rawText.slice(0, 2400),
    };
  }

  private enrichPromotionResult(
    result: Record<string, unknown>,
    rawText: string,
    sourceUrl: string,
  ): Record<string, unknown> {
    const promotion = this.asRecord(result.promotion);
    const units = this.asRecord(result.units);
    const importantDates = this.asRecord(result.important_dates);
    const dataQuality = this.asRecord(result.data_quality);

    const totalHomes = this.extractHomesCount(rawText);
    const homeMix = this.extractHousingMix(rawText);
    const detailedHousingTable = this.extractDetailedHousingTable(rawText);
    const address = this.extractAddress(rawText);
    const municipality = this.extractMunicipality(rawText);
    const promoter = this.extractPromoter(rawText);
    const alertDate = this.extractDate(rawText);

    if (!this.asString(promotion.source_url)) {
      promotion.source_url = sourceUrl;
    }

    if (!this.asString(promotion.address) && address) {
      promotion.address = address;
    }

    if (!this.asString(promotion.full_location) && (address || municipality)) {
      promotion.full_location = [address, municipality].filter(Boolean).join(', ');
    }

    if (!this.asString(promotion.municipality) && municipality) {
      promotion.municipality = municipality;
    }

    if (!this.asString(promotion.promoter) && promoter) {
      promotion.promoter = promoter;
    }

    if (typeof units.total_homes !== 'number' && totalHomes !== null) {
      units.total_homes = totalHomes;
    }

    if (!Array.isArray(units.home_mix) && homeMix.length > 0) {
      units.home_mix = homeMix;
    }

    if (!Array.isArray(units.housing_table) && detailedHousingTable.length > 0) {
      units.housing_table = detailedHousingTable;
    }

    if (!this.asString(importantDates.alert_date) && alertDate) {
      importantDates.alert_date = alertDate;
    }

    if (
      !this.asString(promotion.estimated_publication_date) &&
      alertDate &&
      /60\s*d[ií]as|60\s*dies|seixanta\s*dies/i.test(rawText)
    ) {
      const base = new Date(alertDate);
      if (!Number.isNaN(base.getTime())) {
        const estimated = new Date(base.getTime() + 60 * 24 * 60 * 60 * 1000);
        promotion.estimated_publication_date = estimated.toISOString().slice(0, 10);
        promotion.future_launch = true;
      }
    }

    if (!this.asString(dataQuality.extraction_mode)) {
      dataQuality.extraction_mode = 'ai+heuristic';
    }

    return {
      ...result,
      promotion,
      units,
      important_dates: importantDates,
      data_quality: dataQuality,
    };
  }

  private extractHomesCount(text: string): number | null {
    const match = text.match(/(\d{1,4})\s+(habitatges|viviendas|vivendes|vivienda)/i);
    if (!match) {
      return null;
    }

    const parsed = Number(match[1]);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private extractHousingMix(
    text: string,
  ): Array<{ label: string; homes: number }> {
    const regex = /(\d{1,3})\s+habitatges?\s+de\s+([^\n,.;]+)/gi;
    const rows: Array<{ label: string; homes: number }> = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const homes = Number(match[1]);
      if (Number.isNaN(homes)) {
        continue;
      }

      rows.push({
        label: match[2].trim(),
        homes,
      });
    }

    return rows;
  }

  private extractDetailedHousingTable(
    text: string,
  ): Array<Record<string, unknown>> {
    // Expected row shape from Annex housing table:
    // Planta Porta M2 NumHab NumHab6_8 NumHab8_12 NumHab12plus Ocupacion Precio
    const rowRegex =
      /\b(BX|\d{1,2})\s+(\d{1,2})\s+(\d{1,3},\d{2})\s+(\d{1,2})\s+(-|\d{1,2})\s+(-|\d{1,2})\s+(-|\d{1,2})\s+(\d{1,2})\s+(\d{1,4},\d{2})\s*€?/gi;

    const rows: Array<Record<string, unknown>> = [];
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(text)) !== null) {
      const m2 = this.toNumberWithComma(match[3]);
      const numHabitaciones = this.toInteger(match[4]);
      const hab6_8 = this.toIntegerOrNull(match[5]);
      const hab8_12 = this.toIntegerOrNull(match[6]);
      const hab12plus = this.toIntegerOrNull(match[7]);
      const ocupacion = this.toInteger(match[8]);
      const precio = this.toNumberWithComma(match[9]);

      if (
        m2 === null ||
        numHabitaciones === null ||
        ocupacion === null ||
        precio === null
      ) {
        continue;
      }

      rows.push({
        planta: match[1],
        porta: this.toInteger(match[2]),
        m2_computables: m2,
        numero_habitaciones: numHabitaciones,
        num_habit_6_8_m2: hab6_8,
        num_habit_8_12_m2: hab8_12,
        num_habit_mas_12_m2: hab12plus,
        ocupacion_maxima: ocupacion,
        precio_alquiler_mensual: precio,
      });
    }

    if (rows.length === 0) {
      return rows;
    }

    const deduped = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      const key = `${row.planta}|${row.porta}|${row.m2_computables}|${row.precio_alquiler_mensual}`;
      if (!deduped.has(key)) {
        deduped.set(key, row);
      }
    }

    return [...deduped.values()];
  }

  private toNumberWithComma(value: string): number | null {
    const normalized = value.replace(/\./g, '').replace(',', '.').trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private toInteger(value: string): number | null {
    const parsed = Number(value.trim());
    if (!Number.isInteger(parsed)) {
      return null;
    }
    return parsed;
  }

  private toIntegerOrNull(value: string): number | null {
    const token = value.trim();
    if (token === '-' || token === '') {
      return null;
    }
    return this.toInteger(token);
  }

  private extractAddress(text: string): string | null {
    const match = text.match(
      /(carrer|calle|avinguda|avenida|av\.|c\.)\s+[^,\n]+(?:,\s*\d+)?/i,
    );
    return match?.[0]?.trim() ?? null;
  }

  private extractMunicipality(text: string): string | null {
    const patterns = [
      /al\s+municipi\s+d(?:e|')\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})/i,
      /al\s+municipio\s+de\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})/i,
      /\ba\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})(?:[\.,\n]|$)/i,
      /\bde\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match?.[1]) {
        continue;
      }

      const value = match[1]
        .replace(/\s+en\s+el\s+termini[\s\S]*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (
        !value ||
        /^(sol)$/i.test(value) ||
        /habitatges|hpo|venda|alquiler|termini|dies|detalls|procediment/i.test(
          value,
        )
      ) {
        continue;
      }

      return value;
    }

    return null;
  }

  private extractPromoter(text: string): string | null {
    const match = text.match(
      /promoguts?\s+per\s+(.+?)(?=\s+al\s+municipi\b|\s+a\s+[A-ZÀ-Ú]|\.|,|\n|$)/i,
    );
    if (!match?.[1]) {
      return null;
    }

    return match[1]
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private extractDate(text: string): string | null {
    const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    return Number.isNaN(parsed.getTime())
      ? null
      : parsed.toISOString().slice(0, 10);
  }
}
