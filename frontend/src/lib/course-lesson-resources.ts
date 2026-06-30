import type { CourseResource } from '@/types';

type RichNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
};

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url, 'http://local');
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url.split('?')[0] || url;
  }
}

export function collectEmbeddedMediaRefs(content?: Record<string, unknown> | null) {
  const assetIds = new Set<string>();
  const urls = new Set<string>();

  function walk(node?: RichNode) {
    if (!node) return;

    const attrs = node.attrs;
    if (attrs) {
      if (typeof attrs.assetId === 'string' && attrs.assetId) {
        assetIds.add(attrs.assetId);
      }
      if (typeof attrs.src === 'string' && attrs.src) {
        urls.add(normalizeUrl(attrs.src));
      }
    }

    for (const child of node.content || []) {
      walk(child);
    }
  }

  const nodes = (content as { content?: RichNode[] } | null)?.content;
  for (const node of nodes || []) {
    walk(node);
  }

  return { assetIds, urls };
}

export function filterLessonResourcesForDisplay(
  resources: CourseResource[] | undefined,
  contentJson?: Record<string, unknown> | null,
) {
  if (!resources?.length) return [];

  const embedded = collectEmbeddedMediaRefs(contentJson);

  return resources.filter((resource) => {
    if (resource.kind === 'file') {
      return true;
    }

    if (resource.fileAssetId && embedded.assetIds.has(resource.fileAssetId)) {
      return false;
    }

    if (resource.publicUrl && embedded.urls.has(normalizeUrl(resource.publicUrl))) {
      return false;
    }

    if (contentJson && (resource.kind === 'image' || resource.kind === 'video')) {
      return false;
    }

    return true;
  });
}
