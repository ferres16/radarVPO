import { resolveSalesMode } from './commerce.service';

describe('resolveSalesMode', () => {
  it('honours an explicit salesMode', () => {
    expect(resolveSalesMode({ salesMode: 'maintenance' }, true, true)).toBe(
      'maintenance',
    );
    expect(resolveSalesMode({ salesMode: 'validation' }, true, true)).toBe(
      'validation',
    );
    expect(resolveSalesMode({ salesMode: 'live' }, false, false)).toBe('live');
  });

  it('treats legacy enabled flags as live when salesMode is missing', () => {
    expect(resolveSalesMode({}, true, false)).toBe('live');
    expect(resolveSalesMode({}, false, true)).toBe('live');
  });

  it('defaults to validation when nothing is configured', () => {
    expect(resolveSalesMode({}, false, false)).toBe('validation');
  });
});
