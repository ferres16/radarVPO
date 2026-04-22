import {
  BackofficeNewsItem,
  BackofficeOverview,
  BackofficeUser,
  NewsItem,
  Promotion,
  PromotionDetail,
  PromotionUnit,
  UserProfile,
} from '@/types';
import {
  DeliveryFailure,
  JobRun,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
  getFavorites: () => request<Array<{ id: string; promotion: Promotion }>>('/promotions/user/favorites'),
  getBackofficeOverview: () => request<BackofficeOverview>('/backoffice/overview'),
  getBackofficeJobs: () => request<JobRun[]>('/backoffice/jobs'),
  getBackofficeFailures: () => request<DeliveryFailure[]>('/backoffice/failures'),
  getBackofficeUsers: () => request<BackofficeUser[]>('/backoffice/users'),
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
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, fullName: string) =>
    request<{ user: { id: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),
};
