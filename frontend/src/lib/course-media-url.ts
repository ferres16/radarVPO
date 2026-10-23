import { isGuideVpoSlug } from '@/lib/guide-vpo';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3000/api/v1';

/** Portada de la guía VPO: archivo estático del frontend, no un producto de Stripe. */
export const BRANDED_GUIDE_COVER_SRC = '/covers/guia-vpo.png';

export function getBrandedGuideCoverSrc(slug?: string | null) {
  return isGuideVpoSlug(slug) ? BRANDED_GUIDE_COVER_SRC : null;
}

function looksLikeStorageUrl(url: string) {
  return /amazonaws\.com|\.s3[.-]|cloudfront\.net/i.test(url);
}

export function getCourseCoverSrc(slug: string, coverImage?: string | null) {
  if (!slug) return null;

  if (coverImage) {
    if (!looksLikeStorageUrl(coverImage) && !coverImage.includes('/cover')) {
      return coverImage;
    }
    return `/api/course-covers/${encodeURIComponent(slug)}`;
  }

  return getBrandedGuideCoverSrc(slug);
}

export function getCourseMediaSrc(fileAssetId?: string | null, fallbackSrc?: string | null) {
  if (fileAssetId) {
    return `/api/course-media/${encodeURIComponent(fileAssetId)}`;
  }

  return fallbackSrc || null;
}

export function getBackendCourseCoverUrl(slug: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}/courses/${encodeURIComponent(slug)}/cover`;
}

export function getBackendCourseMediaUrl(fileAssetId: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}/courses/file-assets/${encodeURIComponent(fileAssetId)}/media`;
}
