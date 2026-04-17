import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai/ai.provider.service';
import { NEWS_ANALYSIS_PROMPT, VPO_EXTRACTION_PROMPT } from './ai-prompts';

@Injectable()
export class StructuredExtractionService {
  private readonly logger = new Logger(StructuredExtractionService.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async extractPromotionData(
    rawText: string,
    sourceUrl: string,
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
      return {
        result: this.enrichPromotionResult(fallback, rawText, sourceUrl),
        provider: 'fallback',
        model: 'regex-heuristic',
        confidence: 0.35,
      };
    }

    const parsed = this.safeJsonParse(completion.outputText);
    if (!parsed) {
      return {
        result: this.enrichPromotionResult(
          {
          ...fallback,
          parsing_error: 'AI output was not valid JSON',
          raw_output: completion.outputText,
          },
          rawText,
          sourceUrl,
        ),
        provider: completion.provider,
        model: completion.model,
        confidence: 0.4,
      };
    }

    return {
      result: this.enrichPromotionResult(parsed, rawText, sourceUrl),
      provider: completion.provider,
      model: completion.model,
      confidence: 0.8,
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

  private extractAddress(text: string): string | null {
    const match = text.match(
      /(carrer|calle|avinguda|avenida|av\.|c\.)\s+[^,\n]+(?:,\s*\d+)?/i,
    );
    return match?.[0]?.trim() ?? null;
  }

  private extractMunicipality(text: string): string | null {
    const match = text.match(/\bde\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/);
    if (!match) {
      return null;
    }

    const value = match[1].trim();
    if (/habitatges|hpo|venda|alquiler/i.test(value)) {
      return null;
    }
    return value;
  }

  private extractPromoter(text: string): string | null {
    const match = text.match(/promoguts\s+per\s+([^,\n\.]+)/i);
    return match?.[1]?.trim() ?? null;
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
