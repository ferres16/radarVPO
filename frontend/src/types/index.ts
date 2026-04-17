export type Promotion = {
  id: string;
  title: string;
  municipality?: string | null;
  province?: string | null;
  promotionType: 'venta' | 'alquiler' | 'mixto' | 'desconocido';
  status: 'draft' | 'open' | 'closed' | 'upcoming';
  deadlineDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  estimatedPublicationDate?: string | null;
  futureLaunch?: boolean;
  sourceUrl: string;
};

export type UserProfile = {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  plan: string;
};

export type PromotionDocument = {
  id: string;
  documentUrl: string;
  fileType: string;
  extractedText?: string | null;
  processedAt?: string | null;
};

export type PromotionAiAnalysis = {
  id: string;
  model: string;
  resultJson: Record<string, unknown>;
  confidence?: number | null;
  createdAt: string;
};

export type PromotionDetail = Promotion & {
  rawText?: string | null;
  documents: PromotionDocument[];
  aiAnalysis: PromotionAiAnalysis[];
};

export type NewsItem = {
  id: string;
  title: string;
  sourceName: string;
  summary?: string | null;
  relevance: string;
  publishedAt: string;
};

export type BackofficeOverview = {
  users: number;
  promotions: number;
  upcoming: number;
  news: number;
  jobsFailed: number;
};

export type JobRun = {
  id: string;
  jobName: string;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  errorMessage?: string | null;
};

export type DeliveryFailure = {
  id: string;
  channel: string;
  target: string;
  errorCode: string;
  createdAt: string;
};
