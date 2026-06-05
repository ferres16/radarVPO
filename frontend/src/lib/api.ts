import {
  BackofficeNewsItem,
  BackofficeOverview,
  BackofficeAccessDetail,
  BackofficeUser,
  Course,
  CourseAccessRule,
  CourseAccessRuleType,
  CourseLesson,
  CourseModule,
  CourseResource,
  NewsItem,
  Promotion,
  PromotionDetail,
  PromotionUnit,
  Service,
  UserAccessSummary,
  UserProfile,
} from '@/types';
import {
  DeliveryFailure,
  JobRun,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

type CourseMutationPayload = Partial<
  Pick<
    Course,
    | 'title'
    | 'slug'
    | 'shortDescription'
    | 'longDescription'
    | 'coverImage'
    | 'price'
    | 'currency'
    | 'stripePaymentLink'
    | 'status'
    | 'accessType'
    | 'order'
  >
>;

type ServiceMutationPayload = Partial<
  Pick<Service, 'key' | 'name' | 'description' | 'price' | 'currency' | 'status' | 'serviceType' | 'stripePaymentLink'>
>;

function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const rendered = query.toString();
  return rendered ? `?${rendered}` : '';
}

function nullableText(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

function normalizeCoursePayload(payload: CourseMutationPayload) {
  return {
    ...payload,
    shortDescription: nullableText(payload.shortDescription),
    longDescription: nullableText(payload.longDescription),
    coverImage: nullableText(payload.coverImage),
    price: nullableText(payload.price),
    currency: nullableText(payload.currency),
    stripePaymentLink: nullableText(payload.stripePaymentLink),
  };
}

function normalizeServicePayload(payload: ServiceMutationPayload) {
  return {
    ...payload,
    description: nullableText(payload.description),
    price: nullableText(payload.price),
    currency: nullableText(payload.currency),
    stripePaymentLink: nullableText(payload.stripePaymentLink),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const fallback = `Request failed with status ${res.status}`;
    let message = fallback;

    try {
      const payload = (await res.json()) as { error?: { message?: string } };
      message = payload.error?.message || fallback;
    } catch {
      message = fallback;
    }

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body,
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const fallback = `Request failed with status ${res.status}`;
    throw new Error(fallback);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getPromotions: (query = '') => request<Promotion[]>(`/promotions${query}`),
  getPromotionById: (id: string) => request<PromotionDetail>(`/promotions/${id}`),
  getUpcomingAlerts: () => request<Promotion[]>('/alerts/upcoming'),
  getAlerts: () => request<Promotion[]>('/alerts/upcoming'),
  getNews: () => request<NewsItem[]>('/news'),
  getNewsById: (id: string) => request<NewsItem & { rawText?: string }>(`/news/${id}`),
  getMe: () => request<UserProfile>('/users/me'),
  getMyAccess: () => request<UserAccessSummary>('/users/access'),
  getFavorites: () => request<Array<{ id: string; promotion: Promotion }>>('/promotions/user/favorites'),
  getBackofficeOverview: () => request<BackofficeOverview>('/backoffice/overview'),
  getBackofficeJobs: () => request<JobRun[]>('/backoffice/jobs'),
  getBackofficeFailures: () => request<DeliveryFailure[]>('/backoffice/failures'),
  getBackofficeUsers: (q?: string) => request<BackofficeUser[]>(`/backoffice/users${queryString({ q })}`),
  updateBackofficeUser: (
    id: string,
    payload: Partial<Pick<BackofficeUser, 'fullName' | 'role' | 'plan'>>,
  ) =>
    request<BackofficeUser>(`/backoffice/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getBackofficeNews: () => request<BackofficeNewsItem[]>('/backoffice/news'),
  createBackofficeNews: (
    payload: {
      title: string;
      sourceName: string;
      sourceUrl: string;
      relevance: string;
      publishedAt: string;
      summary?: string;
      body?: string;
      practicalImpact?: string;
      topic?: string;
      rawText?: string;
      itemUrl?: string;
    },
  ) =>
    request<BackofficeNewsItem>('/backoffice/news', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBackofficeNews: (id: string, payload: Record<string, unknown>) =>
    request<BackofficeNewsItem>(`/backoffice/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBackofficeNews: (id: string) =>
    request<{ deleted: boolean }>(`/backoffice/news/${id}`, {
      method: 'DELETE',
    }),
  getBackofficePromotions: (status?: string) =>
    request<PromotionDetail[]>(
      `/backoffice/promotions${status ? `?status=${encodeURIComponent(status)}` : ''}`,
    ),
  getBackofficePromotionById: (id: string) =>
    request<PromotionDetail>(`/backoffice/promotions/${id}`),
  getBackofficePromotionPreview: (id: string) =>
    request<Record<string, unknown>>(`/backoffice/promotions/${id}/preview`),
  updateBackofficePromotion: (id: string, payload: Record<string, unknown>) =>
    request<PromotionDetail>(`/backoffice/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateBackofficePromotionStatus: (id: string, status: Promotion['status']) =>
    request<Promotion>(`/backoffice/promotions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  createBackofficeUnit: (id: string, payload: Partial<PromotionUnit>) =>
    request<PromotionUnit>(`/backoffice/promotions/${id}/units`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBackofficeUnit: (
    id: string,
    unitId: string,
    payload: Partial<PromotionUnit>,
  ) =>
    request<PromotionUnit>(`/backoffice/promotions/${id}/units/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBackofficeUnit: (id: string, unitId: string) =>
    request<{ deleted: boolean }>(`/backoffice/promotions/${id}/units/${unitId}`, {
      method: 'DELETE',
    }),
  deleteAllBackofficeUnits: (id: string) =>
    request<{ deleted: boolean; count: number }>(`/backoffice/promotions/${id}/units`, {
      method: 'DELETE',
    }),
  duplicateBackofficeUnit: (id: string, unitId: string) =>
    request<PromotionUnit>(`/backoffice/promotions/${id}/units/${unitId}/duplicate`, {
      method: 'POST',
    }),
  reorderBackofficeUnits: (id: string, unitIds: string[]) =>
    request<PromotionUnit[]>(`/backoffice/promotions/${id}/units/reorder`, {
      method: 'POST',
      body: JSON.stringify({ unitIds }),
    }),
  importBackofficeUnits: (id: string, text: string) =>
    request<{ imported: number }>(`/backoffice/promotions/${id}/units/import-paste`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  uploadBackofficeDocument: (
    id: string,
    documentKind: 'pdf_original' | 'screenshot' | 'image' | 'support_document',
    file: File,
  ) => {
    const form = new FormData();
    form.append('documentKind', documentKind);
    form.append('file', file);
    return requestForm(`/backoffice/promotions/${id}/documents/upload`, form);
  },
  listCourses: () => request<Course[]>('/courses'),
  listServices: () => request<Service[]>('/services'),
  listCoursesForUser: () => request<Array<Course & { access: { canAccess: boolean; reason: string } }>>('/courses/access'),
  getCourse: (slug: string) => request<Course>(`/courses/${slug}`),
  getCourseForUser: (slug: string) => request<Course & { access: { canAccess: boolean; reason: string } }>(`/courses/${slug}/access`),
  getCourseLesson: (slug: string, lessonSlug: string) =>
    request<{ course: Course; lesson: CourseLesson; access: { canAccess: boolean; reason: string } }>(
      `/courses/${slug}/lessons/${lessonSlug}`,
    ),
  getCourseProgress: (slug: string) =>
    request<{
      courseId: string;
      progressPercent: number;
      completedLessons: number;
      totalLessons: number;
      lastLessonId?: string | null;
    }>(`/courses/${slug}/progress`),
  markLessonCompleted: (slug: string, lessonSlug: string) =>
    request<{ progressPercent: number }>(`/courses/${slug}/lessons/${lessonSlug}/progress`, {
      method: 'POST',
    }),
  getBackofficeCourses: () => request<Course[]>('/backoffice/courses'),
  createBackofficeCourse: (
    payload: CourseMutationPayload,
  ) =>
    request<Course>('/backoffice/courses', {
      method: 'POST',
      body: JSON.stringify(normalizeCoursePayload(payload)),
    }),
  updateBackofficeCourse: (
    id: string,
    payload: CourseMutationPayload,
  ) =>
    request<Course>(`/backoffice/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(normalizeCoursePayload(payload)),
    }),
  deleteBackofficeCourse: (id: string) =>
    request<{ deleted: boolean }>(`/backoffice/courses/${id}`, {
      method: 'DELETE',
    }),
  getBackofficeServices: (q?: string) => request<Service[]>(`/backoffice/services${queryString({ q })}`),
  createBackofficeService: (payload: ServiceMutationPayload) =>
    request<Service>('/backoffice/services', {
      method: 'POST',
      body: JSON.stringify(normalizeServicePayload(payload)),
    }),
  updateBackofficeService: (id: string, payload: ServiceMutationPayload) =>
    request<Service>(`/backoffice/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(normalizeServicePayload(payload)),
    }),
  deleteBackofficeService: (id: string) =>
    request<{ deleted: boolean }>(`/backoffice/services/${id}`, {
      method: 'DELETE',
    }),
  getBackofficeAccessUsers: (q?: string) =>
    request<BackofficeUser[]>(`/backoffice/access/users${queryString({ q })}`),
  getBackofficeAccessUser: (id: string) =>
    request<BackofficeAccessDetail>(`/backoffice/access/users/${id}`),
  updateBackofficeCourseAccess: (userId: string, courseId: string, payload: { isActive?: boolean; notes?: string }) =>
    request<{ id: string; isActive: boolean }>(`/backoffice/access/users/${userId}/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateBackofficeServiceAccess: (userId: string, serviceId: string, payload: { isActive?: boolean; notes?: string }) =>
    request<{ id: string; isActive: boolean }>(`/backoffice/access/users/${userId}/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  createBackofficeCourseModule: (
    courseId: string,
    payload: Pick<CourseModule, 'title' | 'description' | 'order' | 'visibility'>,
  ) =>
    request<CourseModule>(`/backoffice/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reorderBackofficeCourseModules: (courseId: string, ids: string[]) =>
    request<CourseModule[]>(`/backoffice/courses/${courseId}/modules/reorder`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  updateBackofficeCourseModule: (
    moduleId: string,
    payload: Partial<Pick<CourseModule, 'title' | 'description' | 'order' | 'visibility'>>,
  ) =>
    request<CourseModule>(`/backoffice/courses/modules/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBackofficeCourseModule: (moduleId: string) =>
    request<{ deleted: boolean }>(`/backoffice/courses/modules/${moduleId}`, {
      method: 'DELETE',
    }),
  createBackofficeCourseLesson: (
    moduleId: string,
    payload: Pick<CourseLesson, 'title' | 'slug' | 'contentJson' | 'order' | 'durationMinutes' | 'status' | 'type'>,
  ) =>
    request<CourseLesson>(`/backoffice/courses/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reorderBackofficeCourseLessons: (moduleId: string, ids: string[]) =>
    request<CourseLesson[]>(`/backoffice/courses/modules/${moduleId}/lessons/reorder`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  updateBackofficeCourseLesson: (
    lessonId: string,
    payload: Partial<Pick<CourseLesson, 'title' | 'slug' | 'contentJson' | 'order' | 'durationMinutes' | 'status' | 'type'>>,
  ) =>
    request<CourseLesson>(`/backoffice/courses/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBackofficeCourseLesson: (lessonId: string) =>
    request<{ deleted: boolean }>(`/backoffice/courses/lessons/${lessonId}`, {
      method: 'DELETE',
    }),
  uploadBackofficeCourseResource: (
    lessonId: string,
    kind: CourseResource['kind'],
    file: File,
  ) => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('file', file);
    return requestForm<CourseResource>(`/backoffice/courses/lessons/${lessonId}/resources/upload`, form);
  },
  createBackofficeCourseAccessRule: (
    courseId: string,
    payload: { ruleType: CourseAccessRuleType; configJson: Record<string, unknown> },
  ) =>
    request<CourseAccessRule>(`/backoffice/courses/${courseId}/access-rules`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBackofficeCourseAccessRule: (
    ruleId: string,
    payload: Partial<{ ruleType: CourseAccessRuleType; configJson: Record<string, unknown> }>,
  ) =>
    request<CourseAccessRule>(`/backoffice/courses/access-rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteBackofficeCourseAccessRule: (ruleId: string) =>
    request<{ deleted: boolean }>(`/backoffice/courses/access-rules/${ruleId}`, {
      method: 'DELETE',
    }),
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),
  register: (email: string, password: string, fullName: string, phone: string) =>
    request<{ user: { id: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone }),
    }),
  updateMe: (payload: Pick<UserProfile, 'fullName'>) =>
    request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
