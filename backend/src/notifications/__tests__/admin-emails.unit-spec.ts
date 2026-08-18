import {
  collectAdminEmails,
  DEFAULT_CANCELLATION_ADMIN_EMAIL,
} from '../admin-emails';

describe('collectAdminEmails', () => {
  it('always includes the Radar VPO inbox', () => {
    expect(collectAdminEmails(undefined, [])).toEqual([
      DEFAULT_CANCELLATION_ADMIN_EMAIL,
    ]);
  });

  it('merges configured and admin user emails without duplicates', () => {
    expect(
      collectAdminEmails('radarvpo@gmail.com, ops@example.com', [
        'Admin@example.com',
        'radarvpo@gmail.com',
      ]),
    ).toEqual([
      DEFAULT_CANCELLATION_ADMIN_EMAIL,
      'ops@example.com',
      'admin@example.com',
    ]);
  });
});
