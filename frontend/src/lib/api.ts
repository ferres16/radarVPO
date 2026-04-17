import { BackofficeOverview, NewsItem, Promotion, UserProfile } from '@/types';
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

export const api = {
  getPromotions: (query = '') => request<Promotion[]>(`/promotions${query}`),
  getPromotionById: (id: string) => request<Promotion & { rawText?: string }>(`/promotions/${id}`),
  getUpcomingAlerts: () => request<Promotion[]>('/alerts/upcoming'),
  getNews: () => request<NewsItem[]>('/news'),
  getNewsById: (id: string) => request<NewsItem & { rawText?: string }>(`/news/${id}`),
  getMe: () => request<UserProfile>('/users/me'),
  getFavorites: () => request<Array<{ id: string; promotion: Promotion }>>('/promotions/user/favorites'),
  getBackofficeOverview: () => request<BackofficeOverview>('/backoffice/overview'),
  getBackofficeJobs: () => request<JobRun[]>('/backoffice/jobs'),
  getBackofficeFailures: () => request<DeliveryFailure[]>('/backoffice/failures'),
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
