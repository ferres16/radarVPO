'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { HostedVideo } from '@/lib/course-hosted-video';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import type { AnyExtension, Editor } from '@tiptap/core';
import type { CourseResource } from '@/types';

type CourseLessonEditorProps = {
  value?: Record<string, unknown> | null;
  onChange: (next: Record<string, unknown>) => void;
  resources?: CourseResource[];
  onUploadResource?: (file: File, kind: CourseResource['kind']) => Promise<CourseResource | null>;
};

type LessonEditorChain = {
  setImage: (attrs: { src: string; alt?: string }) => { run: () => boolean };
  setYoutubeVideo: (attrs: { src: string; width?: number; height?: number }) => { run: () => boolean };
  insertTable: (attrs: { rows: number; cols: number; withHeaderRow?: boolean }) => { run: () => boolean };
  toggleBold: () => { run: () => boolean };
  toggleItalic: () => { run: () => boolean };
  toggleHighlight: () => { run: () => boolean };
  toggleHeading: (attrs: { level: number }) => { run: () => boolean };
  toggleBulletList: () => { run: () => boolean };
  toggleOrderedList: () => { run: () => boolean };
  toggleTaskList: () => { run: () => boolean };
  toggleBlockquote: () => { run: () => boolean };
  setHorizontalRule: () => { run: () => boolean };
  clearNodes: () => { run: () => boolean };
  unsetAllMarks: () => { clearNodes: () => { run: () => boolean } };
  insertContent: (content: Record<string, unknown>) => { run: () => boolean };
};

function editorChain(editor: Editor): LessonEditorChain {
  return editor.chain().focus() as unknown as LessonEditorChain;
}

const emptyDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function normalizeDoc(value?: Record<string, unknown> | null) {
  if (!value || typeof value !== 'object' || value.type !== 'doc') {
    return emptyDoc;
  }
  return value;
}

export function CourseLessonEditor({
  value,
  onChange,
  resources = [],
  onUploadResource,
}: CourseLessonEditorProps) {
  const [copyMessage, setCopyMessage] = useState('');
  const [uploadingKind, setUploadingKind] = useState<CourseResource['kind'] | ''>('');
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const lastSerializedRef = useRef('');
  const skipNextSyncRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Image.configure({
        allowBase64: false,
        inline: false,
        HTMLAttributes: { class: 'course-editor-image' },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: 'course-editor-video' },
      }),
      HostedVideo,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ] as AnyExtension[],
    content: normalizeDoc(value),
    editorProps: {
      attributes: {
        class:
          'course-lesson-prosemirror min-h-[280px] rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none',
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      const next = editorInstance.getJSON() as Record<string, unknown>;
      skipNextSyncRef.current = true;
      lastSerializedRef.current = JSON.stringify(next);
      onChange(next);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    const next = normalizeDoc(value);
    const serialized = JSON.stringify(next);
    if (serialized === lastSerializedRef.current) return;

    lastSerializedRef.current = serialized;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4 text-sm text-[var(--ink-soft)]">Cargando editor...</div>;
  }

  const handleCopyFormatted = async () => {
    const html = editor.getHTML();
    const text = editor.getText();

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      setCopyMessage('Copiado con formato.');
    } catch {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copiado sin formato.');
    }

    window.setTimeout(() => setCopyMessage(''), 2000);
  };

  const askForUrl = (label: string) => {
    const url = window.prompt(label);
    return url?.trim() || '';
  };

  const insertImageUrl = () => {
    const src = askForUrl('URL de la imagen');
    if (!src) return;
    editorChain(editor).setImage({ src, alt: '' }).run();
  };

  const uploadInlineImage = async (file: File) => {
    if (!onUploadResource) {
      insertImageUrl();
      return;
    }

    setUploadingKind('image');
    try {
      const resource = await onUploadResource(file, 'image');
      if (!resource?.publicUrl) return;
      editorChain(editor).setImage({
        src: resource.publicUrl,
        alt: resource.originalName || '',
      }).run();
    } finally {
      setUploadingKind('');
    }
  };

  const uploadInlineVideo = async (file: File) => {
    if (!onUploadResource) {
      insertVideo();
      return;
    }

    setUploadingKind('video');
    try {
      const resource = await onUploadResource(file, 'video');
      if (!resource?.publicUrl) return;
      editorChain(editor).insertContent({
        type: 'hostedVideo',
        attrs: {
          src: resource.publicUrl,
          title: resource.originalName || 'Vídeo',
        },
      }).run();
    } finally {
      setUploadingKind('');
    }
  };

  const insertHostedVideoUrl = () => {
    const src = askForUrl('URL del vídeo (MP4 o enlace directo)');
    if (!src) return;
    editorChain(editor).insertContent({
      type: 'hostedVideo',
      attrs: { src, title: 'Vídeo' },
    }).run();
  };

  const insertVideo = () => {
    const src = askForUrl('URL de YouTube');
    if (!src) return;
    editorChain(editor).setYoutubeVideo({ src, width: 960, height: 540 }).run();
  };

  const insertCta = () => {
    const href = askForUrl('URL del botón');
    if (!href) return;
    const label = window.prompt('Texto del botón')?.trim() || 'Abrir enlace';
    editorChain(editor).insertContent({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: label,
            marks: [
              { type: 'link', attrs: { href, target: '_blank', rel: 'noopener noreferrer nofollow', class: null } },
              { type: 'bold' },
            ],
          },
        ],
      })
      .run();
  };

  const insertResource = (resource: CourseResource) => {
    const label = resource.originalName || resource.kind;
    const url = resource.publicUrl || '#';

    if (resource.kind === 'image' && resource.publicUrl) {
      editorChain(editor).setImage({ src: resource.publicUrl, alt: label }).run();
      return;
    }

    if (resource.kind === 'video' && resource.publicUrl) {
      editorChain(editor).insertContent({
        type: 'hostedVideo',
        attrs: {
          src: resource.publicUrl,
          title: resource.originalName || 'Vídeo',
        },
      }).run();
      return;
    }

    editorChain(editor).insertContent({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: label,
          marks: [
            { type: 'link', attrs: { href: url, target: '_blank', rel: 'noopener noreferrer nofollow', class: null } },
            { type: 'bold' },
          ],
        },
      ],
    }).run();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Formato</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Texto', action: () => editorChain(editor).clearNodes().run() },
            { label: uploadingKind === 'image' ? 'Subiendo imagen...' : 'Subir imagen', action: () => imageInputRef.current?.click() },
            { label: 'Imagen por URL', action: insertImageUrl },
            { label: uploadingKind === 'video' ? 'Subiendo vídeo...' : 'Subir vídeo', action: () => videoInputRef.current?.click() },
            { label: 'Vídeo por URL', action: insertHostedVideoUrl },
            { label: 'YouTube', action: insertVideo },
            { label: 'Tabla', action: () => editorChain(editor).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
            { label: 'Cita', action: () => editorChain(editor).toggleBlockquote().run() },
            { label: 'Botón', action: insertCta },
            { label: 'Separador', action: () => editorChain(editor).setHorizontalRule().run() },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              disabled={(uploadingKind === 'image' && item.label.includes('Subiendo')) || (uploadingKind === 'video' && item.label.includes('Subiendo'))}
              className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
            >
              {item.label}
            </button>
          ))}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void uploadInlineImage(file);
              event.currentTarget.value = '';
            }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void uploadInlineVideo(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
      </div>
      {resources.length > 0 ? (
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Recursos S3 de esta lección</p>
          <div className="flex flex-wrap gap-2">
            {resources.map((resource) => (
              <button
                key={resource.id}
                type="button"
                onClick={() => insertResource(resource)}
                className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
              >
                Insertar {resource.originalName || resource.kind}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editorChain(editor).toggleBold().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('bold') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Negrita
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleItalic().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('italic') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Italica
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleHighlight().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('highlight') ? 'bg-[var(--green-500)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Destacado
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleHeading({ level: 2 }).run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Titulo
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleBulletList().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('bulletList') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleOrderedList().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('orderedList') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Numerada
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleTaskList().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('taskList') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Checklist
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).toggleBlockquote().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('blockquote') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Callout
        </button>
        <button
          type="button"
          onClick={() => editorChain(editor).unsetAllMarks().clearNodes().run()}
          className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold text-[var(--ink)]"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleCopyFormatted}
          className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-1 text-xs font-semibold text-[var(--ink)]"
        >
          Copiar con formato
        </button>
      </div>
      {copyMessage ? <p className="text-xs text-[var(--ink-soft)]">{copyMessage}</p> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
