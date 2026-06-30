'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type CourseHostedVideoPlayerProps = {
  assetId?: string | null;
  fallbackSrc?: string | null;
  title?: string;
  className?: string;
  wrapperClassName?: string;
};

export function CourseHostedVideoPlayer({
  assetId,
  fallbackSrc,
  title = 'Vídeo',
  className = 'course-editor-hosted-video aspect-video w-full rounded-2xl border border-[var(--stroke)] bg-black',
  wrapperClassName,
}: CourseHostedVideoPlayerProps) {
  const [src, setSrc] = useState<string | null>(fallbackSrc || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!assetId) return;

    let active = true;
    void api
      .getCourseFileAssetUrl(assetId)
      .then((result) => {
        if (!active || !result.url) return;
        setSrc(result.url);
        setFailed(false);
      })
      .catch(() => {
        if (active && !fallbackSrc) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, [assetId, fallbackSrc]);

  const content = !src || failed ? (
    <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] text-sm text-[var(--ink-soft)]">
      {failed ? 'No se pudo cargar el vídeo' : 'Cargando vídeo...'}
    </div>
  ) : (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      title={title}
      className={className}
      onError={() => setFailed(true)}
    />
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{content}</div>;
  }

  return content;
}
