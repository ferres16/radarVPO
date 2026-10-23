import { describe, expect, it } from 'vitest';
import { isBlockedBackendProxyPath } from './backend-proxy-paths';

describe('isBlockedBackendProxyPath', () => {
  it('blocks Stripe webhooks and job triggers', () => {
    expect(isBlockedBackendProxyPath(['billing', 'webhook'])).toBe(true);
    expect(isBlockedBackendProxyPath(['jobs', 'generate-today-news'])).toBe(true);
  });

  it('allows the storefront and authenticated app routes', () => {
    expect(isBlockedBackendProxyPath(['billing', 'checkout'])).toBe(false);
    expect(isBlockedBackendProxyPath(['users', 'me'])).toBe(false);
    expect(isBlockedBackendProxyPath(['backoffice', 'overview'])).toBe(false);
    expect(isBlockedBackendProxyPath(['promotions'])).toBe(false);
    expect(isBlockedBackendProxyPath(['metrics', 'visit'])).toBe(false);
    expect(isBlockedBackendProxyPath(['courses'])).toBe(false);
  });
});
