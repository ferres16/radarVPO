const MB = 1024 * 1024;

/** Hard ceiling for multipart parsing (Multer). Keep above business limits. */
export const MULTER_COURSE_ASSET_MAX_BYTES = 512 * MB;

export function getCourseAssetMaxSizeBytes(): number {
  const configured = Number(process.env.COURSE_ASSET_MAX_SIZE_BYTES);
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return 500 * MB;
}

export function getCourseCoverMaxSizeBytes(): number {
  const configured = Number(process.env.COURSE_COVER_MAX_SIZE_BYTES);
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return 5 * MB;
}

export function getPromotionAssetMaxSizeBytes(): number {
  const configured = Number(process.env.PROMOTION_ASSET_MAX_SIZE_BYTES);
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return 25 * MB;
}

export const ALLOWED_COURSE_ASSET_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const ALLOWED_COURSE_COVER_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
