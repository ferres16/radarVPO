const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3000/api/v1';

function looksLikeStorageUrl(url: string) {
  return /amazonaws\.com|\.s3[.-]|cloudfront\.net/i.test(url);
}

export function getCourseCoverSrc(slug: string, coverImage?: string | null) {
  if (!slug) return null;

  if (coverImage && !looksLikeStorageUrl(coverImage) && !coverImage.includes('/cover')) {
    return coverImage;
  }

  return `/api/course-covers/${encodeURIComponent(slug)}`;
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
