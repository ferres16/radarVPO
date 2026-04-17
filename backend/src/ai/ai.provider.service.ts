import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { AiCompletionInput, AiCompletionResult, AiProvider } from './ai.types';

const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

type JsonObject = Record<string, unknown>;

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(private readonly breaker: CircuitBreakerService) {}

  async complete(input: AiCompletionInput): Promise<AiCompletionResult> {
    const providerOrder = this.resolveProviderOrder();
    let lastError: unknown;

    for (const provider of providerOrder) {
      if (!this.breaker.canRequest(provider)) {
        this.logger.warn(`AI provider skipped by circuit breaker: ${provider}`);
        continue;
      }

      try {
        const result = await this.withRetries(provider, input);
        this.breaker.onSuccess(provider);
        return result;
      } catch (error) {
        lastError = error;
        this.breaker.onFailure(provider);
        this.logger.warn(
          `AI provider failed: ${provider} - ${
            error instanceof Error ? error.message : 'unknown'
          }`,
        );
      }
    }

    throw new ServiceUnavailableException(
      `No AI providers available: ${
        lastError instanceof Error ? lastError.message : 'unknown'
      }`,
    );
  }

  private resolveProviderOrder(): AiProvider[] {
    const configured =
      process.env.AI_PROVIDER_ORDER?.split(',')
        .map((value) => value.trim() as AiProvider)
        .filter((value) =>
          ['openai', 'azure-openai', 'anthropic'].includes(value),
        ) ?? [];

    return configured.length > 0
      ? configured
      : (['openai', 'azure-openai', 'anthropic'] as AiProvider[]);
  }

  private async withRetries(
    provider: AiProvider,
    input: AiCompletionInput,
  ): Promise<AiCompletionResult> {
    const maxAttempts = Number(process.env.AI_MAX_RETRIES ?? 3);
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 30000);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.callProvider(provider, input, timeoutMs);
      } catch (error) {
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt === maxAttempts) {
          throw error;
        }

        const backoff = Math.min(1000 * 2 ** (attempt - 1), 8000);
        const jitter = Math.floor(Math.random() * 300);
        await this.sleep(backoff + jitter);
      }
    }

    throw new Error('unreachable');
  }

  private async callProvider(
    provider: AiProvider,
    input: AiCompletionInput,
    timeoutMs: number,
  ): Promise<AiCompletionResult> {
    if (provider === 'openai') {
      return this.callOpenAi(input, timeoutMs);
    }

    if (provider === 'azure-openai') {
      return this.callAzureOpenAi(input, timeoutMs);
    }

    return this.callAnthropic(input, timeoutMs);
  }

  private async callOpenAi(
    input: AiCompletionInput,
    timeoutMs: number,
  ): Promise<AiCompletionResult> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    const response = await this.postJson(
      'https://api.openai.com/v1/responses',
      {
        model,
        temperature: input.temperature ?? 0.2,
        max_output_tokens: input.maxTokens ?? 1600,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: input.systemPrompt }],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: input.userInput }],
          },
        ],
      },
      {
        Authorization: `Bearer ${apiKey}`,
      },
      timeoutMs,
    );

    const outputText =
      this.readPathString(response, ['output_text']) ??
      this.readPathString(response, ['output', 0, 'content', 0, 'text']) ??
      this.readPathString(response, ['choices', 0, 'message', 'content']);

    if (!outputText || typeof outputText !== 'string') {
      throw new Error('OpenAI response missing output text');
    }

    return {
      provider: 'openai',
      model,
      outputText,
      raw: response,
    };
  }

  private async callAzureOpenAi(
    input: AiCompletionInput,
    timeoutMs: number,
  ): Promise<AiCompletionResult> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21';
    const apiKey = process.env.AZURE_OPENAI_API_KEY;

    if (!endpoint || !deployment || !apiKey) {
      throw new Error('Azure OpenAI not configured');
    }

    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await this.postJson(
      url,
      {
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens ?? 1600,
        messages: [
          { role: 'system', content: input.systemPrompt },
          { role: 'user', content: input.userInput },
        ],
      },
      {
        'api-key': apiKey,
      },
      timeoutMs,
    );

    const outputText = this.readPathString(response, [
      'choices',
      0,
      'message',
      'content',
    ]);
    if (!outputText || typeof outputText !== 'string') {
      throw new Error('Azure OpenAI response missing output text');
    }

    return {
      provider: 'azure-openai',
      model: deployment,
      outputText,
      raw: response,
    };
  }

  private async callAnthropic(
    input: AiCompletionInput,
    timeoutMs: number,
  ): Promise<AiCompletionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest';

    const response = await this.postJson(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: input.maxTokens ?? 1600,
        temperature: input.temperature ?? 0.2,
        system: input.systemPrompt,
        messages: [{ role: 'user', content: input.userInput }],
      },
      {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeoutMs,
    );

    const content = this.readPathArray(response, ['content']);
    const textChunk = content.find(
      (chunk) =>
        this.readPathString(chunk, ['type']) === 'text' &&
        typeof this.readPathString(chunk, ['text']) === 'string',
    );
    const outputText = textChunk
      ? this.readPathString(textChunk, ['text'])
      : undefined;
    if (!outputText || typeof outputText !== 'string') {
      throw new Error('Anthropic response missing output text');
    }

    return {
      provider: 'anthropic',
      model,
      outputText,
      raw: response,
    };
  }

  private async postJson(
    url: string,
    body: Record<string, unknown>,
    headers: Record<string, string>,
    timeoutMs: number,
  ): Promise<JsonObject> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const payloadUnknown: unknown = await response
        .json()
        .catch((): unknown => ({}));
      const payload = this.asJsonObject(payloadUnknown);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`) as Error & {
          status?: number;
          payload?: unknown;
        };
        error.status = response.status;
        error.payload = payload;
        throw error;
      }

      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  private asJsonObject(value: unknown): JsonObject {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as JsonObject;
    }

    return {};
  }

  private readPathString(
    source: unknown,
    path: Array<string | number>,
  ): string | undefined {
    let cursor: unknown = source;

    for (const part of path) {
      if (typeof part === 'number') {
        if (!Array.isArray(cursor) || part < 0 || part >= cursor.length) {
          return undefined;
        }
        cursor = cursor[part];
        continue;
      }

      if (typeof cursor !== 'object' || cursor === null) {
        return undefined;
      }

      cursor = (cursor as JsonObject)[part];
    }

    return typeof cursor === 'string' ? cursor : undefined;
  }

  private readPathArray(
    source: unknown,
    path: Array<string | number>,
  ): unknown[] {
    let cursor: unknown = source;

    for (const part of path) {
      if (typeof part === 'number') {
        if (!Array.isArray(cursor) || part < 0 || part >= cursor.length) {
          return [];
        }
        cursor = cursor[part];
        continue;
      }

      if (typeof cursor !== 'object' || cursor === null) {
        return [];
      }

      cursor = (cursor as JsonObject)[part];
    }

    return Array.isArray(cursor) ? cursor : [];
  }

  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const err = error as Error & { status?: number; name?: string };
    if (err.name === 'AbortError') {
      return true;
    }

    if (typeof err.status === 'number') {
      return RETRYABLE_STATUS.has(err.status);
    }

    return false;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
