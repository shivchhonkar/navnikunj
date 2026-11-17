'use client';

import { youtubeEmbedSrc } from '@/lib/youtube';

export function YoutubeEmbed({
  video,
  title,
  autoplay = false,
  className = '',
}: {
  video: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}) {
  const src = youtubeEmbedSrc(video, autoplay);
  if (!src) return null;
  return (
    <iframe
      src={src}
      title={title || 'YouTube video'}
      className={className || 'h-full w-full'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading={autoplay ? 'eager' : 'lazy'}
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
