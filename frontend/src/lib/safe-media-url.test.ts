import { describe, expect, it } from 'vitest';
import { sanitizeHref, sanitizeImageSrc, sanitizeYoutubeEmbedSrc } from './safe-media-url';

describe('sanitizeHref', () => {
  it('keeps https links and drops javascript or data urls', () => {
    expect(sanitizeHref('https://www.radarvpo.com/condiciones')).toContain('https://www.radarvpo.com/condiciones');
    expect(sanitizeHref('javascript:alert(1)')).toBeNull();
    expect(sanitizeHref('data:text/html,hi')).toBeNull();
    expect(sanitizeHref('http://example.com')).toBeNull();
  });
});

describe('sanitizeImageSrc', () => {
  it('allows same-origin paths and https images', () => {
    expect(sanitizeImageSrc('/api/backend/courses/a/cover')).toBe('/api/backend/courses/a/cover');
    expect(sanitizeImageSrc('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(sanitizeImageSrc('javascript:alert(1)')).toBeNull();
  });
});

describe('sanitizeYoutubeEmbedSrc', () => {
  it('rewrites youtube embeds to the privacy-enhanced host', () => {
    expect(sanitizeYoutubeEmbedSrc('https://www.youtube.com/embed/abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123',
    );
  });

  it('rejects non-embed youtube urls and other hosts', () => {
    expect(sanitizeYoutubeEmbedSrc('https://www.youtube.com/watch?v=abc')).toBeNull();
    expect(sanitizeYoutubeEmbedSrc('https://evil.example/embed/abc')).toBeNull();
  });
});
