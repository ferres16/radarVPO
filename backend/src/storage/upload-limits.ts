export const COURSE_ASSET_MAX_SIZE_BYTES = Number(
  process.env.COURSE_ASSET_MAX_SIZE_BYTES || 200 * 1024 * 1024,
);

export const COURSE_COVER_MAX_SIZE_BYTES = Number(
  process.env.COURSE_COVER_MAX_SIZE_BYTES || 5 * 1024 * 1024,
);

export const PROMOTION_ASSET_MAX_SIZE_BYTES = Number(
  process.env.PROMOTION_ASSET_MAX_SIZE_BYTES || 25 * 1024 * 1024,
);

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
