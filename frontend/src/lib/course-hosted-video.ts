import { Node, mergeAttributes } from '@tiptap/core';

export const HostedVideo = Node.create({
  name: 'hostedVideo',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
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
});
