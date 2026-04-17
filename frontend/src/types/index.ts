export type Promotion = {
  id: string;
  title: string;
  municipality?: string | null;
  province?: string | null;
  promotionType: 'venta' | 'alquiler' | 'mixto' | 'desconocido';
  status: 'draft' | 'open' | 'closed' | 'upcoming';
  deadlineDate?: string | null;
  publishedAt?: string | null;
  estimatedPublicationDate?: string | null;
  sourceUrl: string;
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
