export type Promotion = {
  id: string;
  type?: 'alert' | 'published';
  alertDate?: string;
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
  phone?: string | null;
  role: string;
  plan: string;
  lastLoginAt?: string | null;
};

export type PromotionDocument = {
  id: string;
  documentKind: 'pdf_original' | 'screenshot' | 'image' | 'support_document';
  fileType: string;
  originalName?: string | null;
  storagePath?: string;
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
  archived: number;
  news: number;
  jobsFailed: number;
};

export type BackofficeUser = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  createdAt: string;
};

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseAccessType = 'free' | 'paid' | 'pro' | 'seguimiento';
export type CourseModuleVisibility = 'visible' | 'hidden';
export type LessonStatus = 'draft' | 'published';
export type LessonType = 'text' | 'video' | 'downloadable' | 'faq';
export type CourseAccessRuleType = 'plan' | 'entitlement' | 'purchase' | 'subscription' | 'service';

export type CourseAccessDecision = {
  canAccess: boolean;
  reason: 'free' | 'plan' | 'entitlement' | 'purchase' | 'subscription' | 'service' | 'manual' | 'locked';
};

export type CourseResource = {
  id: string;
  kind: 'image' | 'video' | 'file';
  fileType: string;
  originalName?: string | null;
  storagePath: string;
  publicUrl: string;
  createdAt: string;
};

export type CourseLesson = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  slug: string;
  contentJson?: Record<string, unknown> | null;
  order: number;
  durationMinutes?: number | null;
  status: LessonStatus;
  type: LessonType;
  createdAt?: string;
  updatedAt?: string;
  resources?: CourseResource[];
};

export type CourseModule = {
  id: string;
  courseId?: string;
  title: string;
  description?: string | null;
  order: number;
  visibility: CourseModuleVisibility;
  createdAt?: string;
  updatedAt?: string;
  lessons?: CourseLesson[];
};

export type CourseAccessRule = {
  id: string;
  courseId: string;
  ruleType: CourseAccessRuleType;
  configJson: Record<string, unknown>;
  createdAt: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  coverImage?: string | null;
  price?: string | number | null;
  currency?: string | null;
  stripePaymentLink?: string | null;
  status: CourseStatus;
  accessType: CourseAccessType;
  order: number;
  createdAt: string;
  updatedAt?: string;
  modules?: CourseModule[];
  accessRules?: CourseAccessRule[];
  access?: CourseAccessDecision;
};

export type ServiceStatus = 'active' | 'inactive' | 'archived';
export type ServiceType = 'one_time' | 'subscription' | 'manual';

export type Service = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  status: ServiceStatus;
  serviceType: ServiceType;
  stripePaymentLink?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UserServiceAccess = {
  activatedAt: string;
  service: { id: string; key: string; name: string };
};

export type UserCourseAccess = {
  activatedAt: string;
  course: { id: string; slug: string; title: string };
};

export type UserAccessSummary = {
  services: UserServiceAccess[];
  courses: UserCourseAccess[];
};

export type LessonProgress = {
  id: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string | null;
  updatedAt?: string;
};

export type CourseProgress = {
  id: string;
  courseId: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastLessonId?: string | null;
  updatedAt?: string;
};

export type BackofficeAccessRecord = {
  courseId?: string;
  serviceId?: string;
  isActive: boolean;
  activatedAt: string;
  activatedBy?: string | null;
  activatedByAdmin?: boolean;
  notes?: string | null;
};

export type BackofficeAccessDetail = {
  user: BackofficeUser;
  courses: Course[];
  services: Service[];
  courseAccesses: Array<BackofficeAccessRecord & { courseId: string }>;
  serviceAccesses: Array<BackofficeAccessRecord & { serviceId: string }>;
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
