import type { JSX as ReactJSX, ReactNode } from 'react';

type RichMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichMark[];
  content?: RichNode[];
};

function getMarkHref(attrs?: Record<string, unknown>) {
  const href = attrs?.href;
  return typeof href === 'string' ? href : null;
}

function renderInline(nodes?: RichNode[]): ReactNode {
  if (!nodes?.length) return null;
  return nodes.map((node, index) => {
    const key = `inline-${index}`;
    if (node.type === 'text') {
      let text: ReactNode = node.text || '';
      for (const mark of node.marks || []) {
        if (mark.type === 'bold') text = <strong key={`${key}-b`}>{text}</strong>;
        if (mark.type === 'italic') text = <em key={`${key}-i`}>{text}</em>;
        if (mark.type === 'highlight') text = <mark key={`${key}-h`} className="rounded bg-amber-100 px-1">{text}</mark>;
        if (mark.type === 'link') {
          const href = getMarkHref(mark.attrs);
          if (href) {
            text = (
              <a key={`${key}-l`} href={href} className="font-semibold text-[var(--green-700)] underline" target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            );
          }
        }
        if (mark.type === 'code') text = <code key={`${key}-c`} className="rounded bg-[var(--bg-app)] px-1.5 py-0.5 text-[0.9em]">{text}</code>;
      }
      return <span key={key}>{text}</span>;
    }
    if (node.type === 'hardBreak') return <br key={key} />;
    return null;
  });
}

function renderNodes(nodes?: RichNode[]): ReactNode {
  if (!nodes?.length) return null;

  return nodes.map((node, index) => {
    const key = `${node.type || 'node'}-${index}`;
    const content = renderNodes(node.content || []);
    const inline = renderInline(node.content || []);

    if (node.type === 'paragraph') {
      return <p key={key} className="text-base leading-8 text-[var(--ink-soft)]">{inline}</p>;
    }
    if (node.type === 'heading') {
      const level = Math.min(Math.max(Number(node.attrs?.level || 2), 2), 4);
      const styles = { 2: 'text-3xl', 3: 'text-2xl', 4: 'text-xl' }[level] || 'text-2xl';
      const Tag = `h${level}` as keyof ReactJSX.IntrinsicElements;
      return <Tag key={key} className={`mt-10 font-black tracking-tight text-[var(--ink)] ${styles}`}>{inline}</Tag>;
    }
    if (node.type === 'bulletList' || node.type === 'bullet_list') {
      return <ul key={key} className="my-4 list-disc space-y-2 pl-6 text-base leading-8 text-[var(--ink-soft)]">{content}</ul>;
    }
    if (node.type === 'orderedList' || node.type === 'ordered_list') {
      return <ol key={key} className="my-4 list-decimal space-y-2 pl-6 text-base leading-8 text-[var(--ink-soft)]">{content}</ol>;
    }
    if (node.type === 'listItem' || node.type === 'list_item') {
      return <li key={key}>{content}</li>;
    }
    if (node.type === 'taskList') {
      return <ul key={key} className="my-4 space-y-2">{content}</ul>;
    }
    if (node.type === 'taskItem') {
      const checked = Boolean(node.attrs?.checked);
      return (
        <li key={key} className="flex items-start gap-3 text-base leading-7 text-[var(--ink-soft)]">
          <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${checked ? 'border-[var(--green-700)] bg-[var(--green-700)] text-white' : 'border-[var(--stroke)]'}`}>
            {checked ? '✓' : ''}
          </span>
          <span>{content}</span>
        </li>
      );
    }
    if (node.type === 'blockquote') {
      return (
        <blockquote key={key} className="my-6 rounded-2xl border-l-4 border-[var(--green-700)] bg-[var(--bg-eco)] px-5 py-4 text-base leading-7 text-[var(--ink)]">
          {content}
        </blockquote>
      );
    }
    if (node.type === 'image') {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      if (!src) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={src} alt={alt} className="my-8 w-full rounded-2xl border border-[var(--stroke)] object-cover shadow-sm" />
      );
    }
    if (node.type === 'youtube') {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      if (!src) return null;
      return (
        <iframe
          key={key}
          src={src}
          title="Vídeo de la lección"
          className="my-8 aspect-video w-full rounded-2xl border border-[var(--stroke)] shadow-sm"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (node.type === 'hostedVideo') {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      const title = typeof node.attrs?.title === 'string' ? node.attrs.title : 'Vídeo de la lección';
      if (!src) return null;
      return (
        <video
          key={key}
          src={src}
          controls
          playsInline
          preload="metadata"
          title={title}
          className="my-8 aspect-video w-full rounded-2xl border border-[var(--stroke)] bg-black shadow-sm"
        />
      );
    }
    if (node.type === 'horizontalRule') {
      return <hr key={key} className="my-10 border-[var(--stroke)]" />;
    }
    if (node.type === 'table') {
      return (
        <div key={key} className="my-8 overflow-x-auto rounded-2xl border border-[var(--stroke)]">
          <table className="w-full min-w-[520px] text-sm">{content}</table>
        </div>
      );
    }
    if (node.type === 'tableRow') return <tr key={key}>{content}</tr>;
    if (node.type === 'tableHeader') return <th key={key} className="bg-[var(--bg-app)] px-4 py-3 text-left font-bold text-[var(--ink)]">{content}</th>;
    if (node.type === 'tableCell') return <td key={key} className="border-t border-[var(--stroke)] px-4 py-3 text-[var(--ink-soft)]">{content}</td>;
    if (node.type === 'codeBlock') {
      const code = node.content?.map((item) => item.text || '').join('') || '';
      return (
        <pre key={key} className="my-6 overflow-x-auto rounded-2xl bg-[var(--ink)] p-4 text-sm text-white">
          <code>{code}</code>
        </pre>
      );
    }
    return content ? <div key={key}>{content}</div> : null;
  });
}

export function CourseTipTapRenderer({ content }: { content?: Record<string, unknown> | null }) {
  const nodes = (content as { content?: RichNode[] } | null)?.content;
  if (!nodes?.length) {
    return <p className="text-sm text-[var(--ink-soft)]">Contenido pendiente.</p>;
  }
  return <article className="course-prose space-y-2">{renderNodes(nodes)}</article>;
}
