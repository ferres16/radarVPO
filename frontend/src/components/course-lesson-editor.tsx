'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';

type CourseLessonEditorProps = {
  value?: Record<string, unknown> | null;
  onChange: (next: Record<string, unknown>) => void;
};

const emptyDoc = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
};

export function CourseLessonEditor({ value, onChange }: CourseLessonEditorProps) {
  const editor = useEditor({
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
    ],
    content: value ?? emptyDoc,
    editorProps: {
      attributes: {
        class:
          'min-h-[220px] rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none',
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value ?? emptyDoc;
    editor.commands.setContent(next, false);
  }, [editor, value]);

  if (!editor) {
    return <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4 text-sm text-[var(--ink-soft)]">Cargando editor...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('bold') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Negrita
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('italic') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Italica
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('highlight') ? 'bg-[var(--green-500)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Destacado
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Titulo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('bulletList') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('orderedList') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Numerada
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('taskList') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Checklist
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold ${editor.isActive('blockquote') ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
          Callout
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold text-[var(--ink)]"
        >
          Limpiar
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
