export function isStorageUrl(url: string): boolean {
  return /amazonaws\.com|\.s3[.-]|cloudfront\.net/i.test(url);
}

export function isSafeExternalCheckoutUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  if (isStorageUrl(url)) return false;
  return true;
}

export function resolveSafeExternalHref(
  url: string | null | undefined,
  fallback: string,
): string {
  return isSafeExternalCheckoutUrl(url) ? url! : fallback;
}
