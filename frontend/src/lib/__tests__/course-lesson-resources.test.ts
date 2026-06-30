import { describe, expect, it } from 'vitest';
import { filterLessonResourcesForDisplay } from '../course-lesson-resources';
import type { CourseResource } from '@/types';

const baseResource = (overrides: Partial<CourseResource>): CourseResource => ({
  id: 'r1',
  kind: 'video',
  fileType: 'video/mp4',
  storagePath: 'path/video.mp4',
  publicUrl: 'https://cdn.example.com/video.mp4',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('filterLessonResourcesForDisplay', () => {
  it('hides image and video attachments when lesson already has rich content', () => {
    const resources = [
      baseResource({ id: 'v1', kind: 'video' }),
      baseResource({ id: 'i1', kind: 'image', publicUrl: 'https://cdn.example.com/photo.jpg' }),
      baseResource({ id: 'f1', kind: 'file', publicUrl: 'https://cdn.example.com/guide.pdf' }),
    ];

    const filtered = filterLessonResourcesForDisplay(resources, {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hola' }] }],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.kind).toBe('file');
  });

  it('removes resources already embedded in content by asset id', () => {
    const resources = [
      baseResource({ id: 'v1', fileAssetId: 'asset-1' }),
      baseResource({ id: 'f1', kind: 'file', fileAssetId: 'asset-2' }),
    ];

    const filtered = filterLessonResourcesForDisplay(resources, {
      type: 'doc',
      content: [
        {
          type: 'hostedVideo',
          attrs: { assetId: 'asset-1', src: 'https://cdn.example.com/video.mp4' },
        },
      ],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.fileAssetId).toBe('asset-2');
  });
});
