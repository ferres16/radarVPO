'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { getCourseMediaSrc } from '@/lib/course-media-url';

export function CourseHostedVideoView({ node }: NodeViewProps) {
  const assetId = typeof node.attrs.assetId === 'string' ? node.attrs.assetId : null;
  const fallbackSrc = typeof node.attrs.src === 'string' ? node.attrs.src : null;
  const title = typeof node.attrs.title === 'string' ? node.attrs.title : 'Vídeo';
  const src = getCourseMediaSrc(assetId, fallbackSrc);

  if (!src) {
    return (
      <NodeViewWrapper className="course-editor-hosted-video-wrapper">
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] text-sm text-[var(--ink-soft)]">
          Vídeo no disponible
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="course-editor-hosted-video-wrapper">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        title={title}
        className="course-editor-hosted-video aspect-video w-full rounded-2xl border border-[var(--stroke)] bg-black"
      />
    </NodeViewWrapper>
  );
}
