import { Injectable, Logger } from '@nestjs/common';

export type HousingNewsCandidate = {
  sourceItemId: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  link: string;
  snippet: string;
  content: string;
  publishedAt: Date;
  category: 'vpo' | 'alquiler' | 'ayudas' | 'normativa' | 'general';
  municipality: string;
  score: number;
  matchedKeywords: string[];
};

export type GeneratedNewsDraft = {
  sourceItemId: string;
  title: string;
  summary: string;
  content: string;
  category: 'vpo' | 'alquiler' | 'ayudas' | 'normativa' | 'general';
  municipality: string;
  isFeatured: boolean;
};

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  async generateHousingNewsArticles(
    candidates: HousingNewsCandidate[],
    maxArticles = 2,
  ): Promise<GeneratedNewsDraft[] | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return null;
    }

    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini';
    const baseUrl =
      process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1';

    const payload = {
      model,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'Eres un editor especializado en vivienda en Catalunya.',
            'Solo puedes usar la informacion que aparece en el candidato elegido (title, snippet, content, link).',
            'Cada article DEBE conservar el sourceItemId del candidato del que sale; no mezcles hechos de candidatos distintos.',
            'No inventes hechos, fechas, cifras, porcentajes, municipios ni territorios.',
            'Si el candidato no habla de Catalunya/Barcelona/Girona/Lleida/Tarragona/Generalitat/habitatge, no lo uses.',
            'Si el candidato habla de otra comunidad autonoma, descartalo.',
            'Toda cifra o porcentaje del borrador debe aparecer en el texto del candidato.',
            'Debes generar contenido propio, claro y util; no copies texto literal largo.',
            'Devuelve un JSON valido con la forma {"articles":[...]}.',
            'Cada article debe tener sourceItemId, title, summary, content, category, municipality e isFeatured.',
            'Selecciona como maximo 2 articulos. Cada contenido debe tener entre 250 y 300 palabras.',
            'El titular debe ser directo. La entradilla resume la noticia en 2-3 lineas sin ampliar el ambito geografico.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify(
            {
              maxArticles,
              requiredFocus:
                'vivienda en Catalunya, priorizando VPO, vivienda publica, alquiler asequible, ayudas y normativa',
              candidates,
            },
            null,
            2,
          ),
        },
      ],
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.warn(
        `AI generation failed with ${response.status}: ${detail}`,
      );
      throw new Error(`AI generation failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI response did not include content');
    }

    const parsed = JSON.parse(content) as {
      articles?: Array<Partial<GeneratedNewsDraft> & { sourceItemId?: string }>;
    };

    if (!Array.isArray(parsed.articles)) {
      throw new Error('AI response did not include articles array');
    }

    const allowedIds = new Set(candidates.map((item) => item.sourceItemId));
    return parsed.articles
      .filter((article): article is GeneratedNewsDraft => {
        if (!article?.sourceItemId || !allowedIds.has(article.sourceItemId)) {
          return false;
        }
        if (!article.title || !article.summary || !article.content) {
          return false;
        }
        return true;
      })
      .slice(0, maxArticles)
      .map((article) => ({
        sourceItemId: article.sourceItemId,
        title: article.title.trim(),
        summary: article.summary.trim(),
        content: article.content.trim(),
        category: this.normalizeCategory(article.category),
        municipality: article.municipality?.trim() || 'Catalunya',
        isFeatured: Boolean(article.isFeatured),
      }));
  }

  /**
   * Genera una imagen de portada coherente con la noticia (OpenAI Images).
   * Devuelve null si no hay API key o el proveedor falla (la noticia se publica igual).
   */
  async generateNewsCoverImage(input: {
    title: string;
    summary?: string | null;
    category?: string | null;
    municipality?: string | null;
  }): Promise<{ buffer: Buffer; contentType: string; prompt: string } | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      this.logger.warn('News cover skipped: OPENAI_API_KEY missing');
      return null;
    }

    const model = process.env.OPENAI_IMAGE_MODEL?.trim() || 'dall-e-3';
    const baseUrl =
      process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1';

    const place = input.municipality?.trim() || 'Catalunya';
    const topic = input.category?.trim() || 'vivienda';
    const summary = (input.summary || '').trim().slice(0, 280);
    const prompt = [
      'Editorial illustration for a Catalonia housing news article.',
      'Clean modern style, soft greens and blues, no text, no logos, no watermarks,',
      'no readable letters, photorealistic or flat illustration suitable as a card cover.',
      `Topic: ${topic}. Place: ${place}.`,
      `Headline context: ${input.title.slice(0, 160)}.`,
      summary ? `Summary: ${summary}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    try {
      const body: Record<string, unknown> = {
        model,
        prompt,
        size: '1024x1024',
        n: 1,
      };
      // Solo dall-e-2/3 en api.openai.com; Azure/gpt-image no aceptan response_format.
      const isClassicDallE =
        /^dall-e-[23]$/i.test(model) &&
        !baseUrl.includes('azure') &&
        !baseUrl.includes('cognitiveservices');
      if (isClassicDallE) {
        body.response_format = 'b64_json';
        body.quality = 'standard';
      }

      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        this.logger.warn(
          `News cover image failed with ${response.status}: ${detail}`,
        );
        return null;
      }

      const data = (await response.json()) as {
        data?: Array<{ b64_json?: string; url?: string }>;
      };
      const item = data.data?.[0];
      if (item?.b64_json) {
        return {
          buffer: Buffer.from(item.b64_json, 'base64'),
          contentType: 'image/png',
          prompt,
        };
      }
      if (item?.url) {
        const imageResponse = await fetch(item.url);
        if (!imageResponse.ok) return null;
        const arrayBuffer = await imageResponse.arrayBuffer();
        const contentType =
          imageResponse.headers.get('content-type') || 'image/png';
        return {
          buffer: Buffer.from(arrayBuffer),
          contentType,
          prompt,
        };
      }
      return null;
    } catch (error) {
      this.logger.warn(
        `News cover image error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private normalizeCategory(category?: string): GeneratedNewsDraft['category'] {
    const value = category?.toLowerCase().trim();
    if (
      value === 'vpo' ||
      value === 'alquiler' ||
      value === 'ayudas' ||
      value === 'normativa'
    ) {
      return value;
    }
    return 'general';
  }
}
