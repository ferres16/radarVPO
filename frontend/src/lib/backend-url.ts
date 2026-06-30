export function getBackendApiUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000/api/v1'
  ).replace(/\/$/, '');
}

export function getBrowserApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }

  return getBackendApiUrl();
}
