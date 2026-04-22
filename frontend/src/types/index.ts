export type Promotion = {
  id: string;
  title: string;
  location?: string | null;
  municipality?: string | null;
  province?: string | null;
  promotionType: 'venta' | 'alquiler' | 'mixto' | 'desconocido';
  status: 'pending_review' | 'published_unreviewed' | 'published_reviewed' | 'archived';
  statusMessage?: string;
  promoter?: string | null;
  totalHomes?: number | null;
  deadlineDate?: string | null;
  publishedAt?: string | null;
  alertDetectedAt?: string;
  createdAt?: string;
  estimatedPublicationDate?: string | null;
  publicDescription?: string | null;
  availableUnitsText?: string | null;
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
  documentKind: 'pdf_original' | 'screenshot' | 'image' | 'support_document';
  fileType: string;
  originalName?: string | null;
  storagePath: string;
  publicUrl: string;
  uploadedBy?: string | null;
};

export type PromotionUnit = {
  id: string;
  rowOrder: number;
  unitLabel?: string | null;
  building?: string | null;
  stair?: string | null;
  floor?: string | null;
  door?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  usefulAreaM2?: string | number | null;
  builtAreaM2?: string | number | null;
  priceSale?: string | number | null;
  monthlyRent?: string | number | null;
  reservation?: string | number | null;
  notes?: string | null;
  extraData?: Record<string, unknown> | null;
};

export type PromotionDetail = Promotion & {
  rawText?: string | null;
  importantDates?: Record<string, unknown> | null;
  requirements?: Record<string, unknown> | null;
  economicInfo?: Record<string, unknown> | null;
  feesAndReservations?: Record<string, unknown> | null;
  contactInfo?: Record<string, unknown> | null;
  documents: PromotionDocument[];
  units: PromotionUnit[];
};

export type NewsItem = {
  id: string;
  slug?: string | null;
  title: string;
  sourceName: string;
  sourceUrl: string;
  summary?: string | null;
  body?: string | null;
  practicalImpact?: string | null;
  topic?: string | null;
  category?: 'vpo' | 'alquiler' | 'ayudas' | 'normativa' | 'general';
  municipality?: string | null;
  relevance: string;
  publishedAt: string;
};

export type BackofficeOverview = {
  users: number;
  promotions: number;
  pendingReview: number;
  publishedUnreviewed: number;
  publishedReviewed: number;
  news: number;
  jobsFailed: number;
};

export type BackofficeUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  createdAt: string;
};

export type BackofficeNewsItem = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  itemUrl: string;
  rawText?: string | null;
  summary?: string | null;
  body?: string | null;
  practicalImpact?: string | null;
  topic?: string | null;
  relevance: string;
  publishedAt: string;
  createdAt: string;
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
