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
        result: fallback,
        provider: 'fallback',
        model: 'regex-heuristic',
        confidence: 0.35,
      };
    }

    const parsed = this.safeJsonParse(completion.outputText);
    if (!parsed) {
      return {
        result: {
          ...fallback,
          parsing_error: 'AI output was not valid JSON',
          raw_output: completion.outputText,
        },
        provider: completion.provider,
        model: completion.model,
        confidence: 0.4,
      };
    }

    return {
      result: parsed,
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
      data_quality: {
        extraction_mode: 'fallback',
        ambiguous_fields: [],
      },
      raw_excerpt: rawText.slice(0, 2400),
    };
  }
}
