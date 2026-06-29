import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CourseHostedVideoView } from '@/components/course-hosted-video-view';

export const HostedVideo = Node.create({
  name: 'hostedVideo',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      assetId: {
        default: null,
      },
      src: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        controls: true,
        playsInline: true,
        preload: 'metadata',
        class: 'course-editor-hosted-video',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CourseHostedVideoView);
  },
});
