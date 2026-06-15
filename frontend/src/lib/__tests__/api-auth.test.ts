import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api';

describe('api auth transport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('uses httpOnly cookie transport instead of storing bearer tokens', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u1', email: 'user@example.com' }, accessToken: 'server-token' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    await api.login('user@example.com', 'password123');

    expect(setItemSpy).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      }),
    );
  });
});
