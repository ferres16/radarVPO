import 'reflect-metadata';
import { isRecipientAllowed, messagingAllowlist } from '../app-environment';
import { validateEnv } from '../../config/env.validation';

describe('app environment guards', () => {
  it('does not filter recipients in production or without APP_ENV', () => {
    expect(messagingAllowlist({})).toBeNull();
    expect(
      messagingAllowlist({
        APP_ENV: 'production',
        MESSAGING_ALLOWLIST: 'a@b.c',
      }),
    ).toBeNull();
    expect(
      isRecipientAllowed('anyone@example.com', messagingAllowlist({})),
    ).toBe(true);
  });

  it('only allows listed emails, domains and phones outside production', () => {
    const list = messagingAllowlist({
      APP_ENV: 'staging',
      MESSAGING_ALLOWLIST: 'Owner@Example.com, @radarvpo.test, +34 600 111 222',
    });
    expect(isRecipientAllowed('owner@example.com', list)).toBe(true);
    expect(isRecipientAllowed('qa@radarvpo.test', list)).toBe(true);
    expect(isRecipientAllowed('600111222', list)).toBe(true);
    expect(isRecipientAllowed('+34600111222', list)).toBe(true);
    expect(isRecipientAllowed('real.user@gmail.com', list)).toBe(false);
    expect(isRecipientAllowed('+34699999999', list)).toBe(false);
    expect(isRecipientAllowed(undefined, list)).toBe(false);
  });

  it('does not filter when the allowlist variable is not defined', () => {
    expect(messagingAllowlist({ APP_ENV: 'staging' })).toBeNull();
  });

  it('blocks everything outside production when the allowlist is empty', () => {
    expect(
      isRecipientAllowed(
        'owner@example.com',
        messagingAllowlist({ APP_ENV: 'staging', MESSAGING_ALLOWLIST: '' }),
      ),
    ).toBe(false);
  });

  it('refuses live Stripe keys outside production', () => {
    const base = {
      DATABASE_URL: 'postgresql://x:y@localhost:5432/db',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
    };
    expect(() =>
      validateEnv({
        ...base,
        APP_ENV: 'staging',
        STRIPE_SECRET_KEY: 'sk_live_123',
      }),
    ).toThrow(/Stripe test keys/);
    expect(() =>
      validateEnv({
        ...base,
        APP_ENV: 'staging',
        STRIPE_SECRET_KEY: 'sk_test_123',
      }),
    ).not.toThrow();
    expect(() =>
      validateEnv({ ...base, STRIPE_SECRET_KEY: 'sk_live_123' }),
    ).not.toThrow();
  });
});
