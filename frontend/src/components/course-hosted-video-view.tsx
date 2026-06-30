'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { CourseHostedVideoPlayer } from '@/components/course-hosted-video-player';

export function CourseHostedVideoView({ node }: NodeViewProps) {
  const assetId = typeof node.attrs.assetId === 'string' ? node.attrs.assetId : null;
  const fallbackSrc = typeof node.attrs.src === 'string' ? node.attrs.src : null;
  const title = typeof node.attrs.title === 'string' ? node.attrs.title : 'Vídeo';

  return (
    <NodeViewWrapper className="course-editor-hosted-video-wrapper">
      <CourseHostedVideoPlayer
        assetId={assetId}
        fallbackSrc={fallbackSrc}
        title={title}
      />
    </NodeViewWrapper>
  );
}
