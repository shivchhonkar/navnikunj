const ID = /^[\w-]{11}$/;

export function youtubeId(value: string) {
  const raw = value.trim();
  if (!raw) return '';
  if (ID.test(raw)) return raw;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      return ID.test(id) ? id : '';
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = url.searchParams.get('v') || '';
      if (ID.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      const marker = parts.findIndex((part) => part === 'embed' || part === 'shorts' || part === 'live' || part === 'v');
      const fromPath = marker >= 0 ? parts[marker + 1] || '' : '';
      return ID.test(fromPath) ? fromPath : '';
    }
  } catch {
    return '';
  }
  return '';
}

export function youtubeEmbedSrc(value: string, autoplay = false) {
  const id = youtubeId(value);
  if (!id) return '';
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '1');
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumb(value: string) {
  const id = youtubeId(value);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

export function readYoutube(value: unknown) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return { video: '' };
  if (!youtubeId(raw)) return { error: 'Enter a YouTube link like https://youtu.be/… or https://www.youtube.com/watch?v=…' };
  return { video: raw };
}
