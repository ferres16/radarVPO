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
    const baseUrl = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1';

    const payload = {
      model,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'Eres un editor especializado en vivienda en Catalunya.',
            'Solo puedes usar la informacion que aparece en los candidatos.',
            'Debes generar contenido propio, claro, util y nada institucional.',
            'No copies texto literal. No inventes hechos, fechas, cifras ni municipios.',
            'Devuelve un JSON valido con la forma {"articles":[...]}.',
            'Cada article debe tener sourceItemId, title, summary, content, category, municipality e isFeatured.',
            'Selecciona como maximo 2 articulos. Cada contenido debe tener entre 250 y 300 palabras.',
            'El titular debe ser directo y con gancho. La entradilla debe resumir la noticia en 2-3 lineas.',
            'El cuerpo debe explicar impacto real para una persona que busca vivienda en Catalunya.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify(
            {
              maxArticles,
              requiredFocus: 'vivienda en Catalunya, priorizando VPO, vivienda publica, alquiler asequible, ayudas y normativa',
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
      this.logger.warn(`AI generation failed with ${response.status}: ${detail}`);
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

  private normalizeCategory(category?: string): GeneratedNewsDraft['category'] {
    const value = category?.toLowerCase().trim();
    if (value === 'vpo' || value === 'alquiler' || value === 'ayudas' || value === 'normativa') {
      return value;
    }
    return 'general';
  }
}
