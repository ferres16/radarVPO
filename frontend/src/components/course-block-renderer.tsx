/* eslint-disable @next/next/no-img-element */
import type { CourseAsset, CourseContentBlock } from '@/types';

type BlockContent = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function items(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function legacyTipTapText(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const node = value as { text?: unknown; content?: unknown };
  const ownText = typeof node.text === 'string' ? node.text : '';
  const childText = Array.isArray(node.content)
    ? node.content.map((child) => legacyTipTapText(child)).filter(Boolean).join('\n')
    : '';
  return [ownText, childText].filter(Boolean).join('\n');
}

function assetUrl(block: CourseContentBlock, assetId?: unknown) {
  const id = typeof assetId === 'string' ? assetId : '';
  const asset = block.assets?.find((item) => item.id === id);
  return asset?.url || text((block.content as BlockContent).url);
}

function assetLabel(asset?: CourseAsset, fallback?: unknown) {
  return asset?.originalName || text(fallback) || 'Descargar archivo';
}

export function CourseBlockRenderer({ blocks }: { blocks?: CourseContentBlock[] }) {
  if (!blocks?.length) {
    return <p className="text-sm text-[var(--ink-soft)]">Contenido pendiente.</p>;
  }

  return (
    <div className="space-y-5">
      {[...blocks]
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const content = block.content || {};
          const key = block.id;

          if (block.type === 'heading') {
            const level = Math.min(Math.max(Number(content.level || 2), 2), 4);
            const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
            return <Tag key={key} className="text-2xl font-black text-[var(--ink)]">{text(content.text)}</Tag>;
          }

          if (block.type === 'paragraph') {
            const body = text(content.text) || legacyTipTapText(content.legacyTipTap);
            return <p key={key} className="text-sm leading-7 text-[var(--ink-soft)] whitespace-pre-wrap">{body}</p>;
          }

          if (block.type === 'image') {
            const src = assetUrl(block, content.assetId);
            if (!src) return null;
            return (
              <figure key={key} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={text(content.alt)} className="w-full rounded-3xl border border-[var(--stroke)] object-cover shadow-card" />
                {content.caption ? <figcaption className="text-xs text-[var(--ink-soft)]">{text(content.caption)}</figcaption> : null}
              </figure>
            );
          }

          if (block.type === 'video') {
            const src = assetUrl(block, content.assetId) || text(content.src);
            if (!src) return null;
            return <video key={key} src={src} controls className="aspect-video w-full rounded-3xl border border-[var(--stroke)] bg-black shadow-card" />;
          }

          if (block.type === 'document') {
            const asset = block.assets?.find((item) => item.id === content.assetId);
            const href = asset?.url || text(content.url);
            if (!href) return null;
            return <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm font-semibold text-[var(--ink)] underline">{assetLabel(asset, content.label)}</a>;
          }

          if (block.type === 'list') {
            const listItems = items(content.items);
            const ordered = content.style === 'ordered';
            const ListTag = (ordered ? 'ol' : 'ul') as 'ol' | 'ul';
            return <ListTag key={key} className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-2 pl-5 text-sm leading-6 text-[var(--ink-soft)]`}>{listItems.map((item) => <li key={item}>{item}</li>)}</ListTag>;
          }

          if (block.type === 'quote') {
            return <blockquote key={key} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">{text(content.text)}{content.attribution ? <footer className="mt-3 text-xs font-semibold text-emerald-800">{text(content.attribution)}</footer> : null}</blockquote>;
          }

          if (block.type === 'divider') {
            return <hr key={key} className="border-[var(--stroke)]" />;
          }

          if (block.type === 'callout') {
            return <aside key={key} className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><strong>{text(content.title) || 'Aviso'}</strong><p className="mt-2 leading-6">{text(content.text)}</p></aside>;
          }

          if (block.type === 'button') {
            const href = text(content.href) || '#';
            return <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="inline-flex rounded-full bg-[var(--green-500)] px-5 py-2 text-sm font-semibold text-white">{text(content.label) || 'Abrir enlace'}</a>;
          }

          if (block.type === 'gallery') {
            const galleryAssets = block.assets?.filter((asset) => asset.kind === 'image') || [];
            return <div key={key} className="grid gap-3 sm:grid-cols-2">{galleryAssets.map((asset) => asset.url ? <img key={asset.id} src={asset.url} alt={asset.altText || ''} className="h-56 w-full rounded-2xl border border-[var(--stroke)] object-cover" /> : null)}</div>;
          }

          if (block.type === 'attachments') {
            const attachmentAssets = block.assets || [];
            return <div key={key} className="grid gap-2 sm:grid-cols-2">{attachmentAssets.map((asset) => asset.url ? <a key={asset.id} href={asset.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[var(--stroke)] bg-white p-3 text-sm font-semibold text-[var(--ink)] underline">{asset.originalName || 'Archivo adjunto'}</a> : null)}</div>;
          }

          return null;
        })}
    </div>
  );
}
