export const DEFAULT_CANCELLATION_ADMIN_EMAIL = 'radarvpo@gmail.com';

export function collectAdminEmails(
  configured: string | undefined,
  adminUserEmails: string[],
): string[] {
  const fromEnv = (configured || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.includes('@'));

  return [
    ...new Set([
      DEFAULT_CANCELLATION_ADMIN_EMAIL,
      ...fromEnv,
      ...adminUserEmails.map((email) => email.trim().toLowerCase()).filter(Boolean),
    ]),
  ];
}
