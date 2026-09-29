'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Maximize2, X, ZoomIn } from 'lucide-react';
import type { GalleryImage } from '@/lib/types';

export function GalleryView({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = index === null ? null : images[index];

  const step = (delta: number) => {
    setZoomed(false);
    setIndex((current) => {
      if (current === null) return current;
      return (current + delta + images.length) % images.length;
    });
  };

  useEffect(() => {
    if (index === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIndex(null);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [index, images.length]);

  const fullscreen = async () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await frame.requestFullscreen();
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((item, itemIndex) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => { setZoomed(false); setIndex(itemIndex); }}
              className="group relative block w-full overflow-hidden bg-stone-200"
              aria-label={`View ${item.alt || item.caption || 'photograph'}`}
            >
              <img src={item.src} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 px-3 text-center transition group-hover:bg-black/45 group-focus-visible:bg-black/45">
                <Eye className="text-white opacity-0 drop-shadow transition group-hover:opacity-100 group-focus-visible:opacity-100" size={28} strokeWidth={1.75} aria-hidden />
                {item.caption || item.alt ? (
                  <span className="line-clamp-3 max-w-full text-sm font-medium leading-5 text-white opacity-0 drop-shadow transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {item.caption || item.alt}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {image && index !== null ? (
        <div
          ref={frameRef}
          className="fixed inset-0 z-50 bg-black/80"
          role="dialog"
          aria-modal="true"
          aria-label={image.alt || image.caption || 'Photograph'}
          onClick={() => setIndex(null)}
        >
          <p className="absolute left-4 top-4 z-10 text-sm font-medium text-white">{index + 1} / {images.length}</p>
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
            <button type="button" onClick={(event) => { event.stopPropagation(); fullscreen(); }} className="grid h-10 w-10 place-items-center rounded-md text-white hover:bg-white/15" aria-label="Full screen">
              <Maximize2 size={18} />
            </button>
            <button type="button" onClick={(event) => { event.stopPropagation(); setZoomed((value) => !value); }} className="grid h-10 w-10 place-items-center rounded-md text-white hover:bg-white/15" aria-label={zoomed ? 'Zoom out' : 'Zoom in'}>
              <ZoomIn size={18} />
            </button>
            <button ref={closeRef} type="button" onClick={() => setIndex(null)} className="grid h-10 w-10 place-items-center rounded-md text-white hover:bg-white/15" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <button type="button" onClick={(event) => { event.stopPropagation(); step(-1); }} className="absolute left-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full text-white hover:bg-white/15" aria-label="Previous photograph">
            <ChevronLeft size={36} />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); step(1); }} className="absolute right-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full text-white hover:bg-white/15" aria-label="Next photograph">
            <ChevronRight size={36} />
          </button>

          <div className="pointer-events-none flex h-full items-center justify-center px-14 py-16">
            <figure className={`pointer-events-auto flex max-h-full max-w-5xl flex-col items-center ${zoomed ? 'max-h-[78vh] overflow-auto' : ''}`} onClick={(event) => event.stopPropagation()}>
              <img
                src={image.src}
                alt={image.alt}
                className={zoomed ? 'max-w-none w-[min(140vw,1600px)] object-contain' : 'max-h-[78vh] w-auto max-w-[88vw] object-contain'}
              />
              <figcaption className="mt-3 text-center text-sm text-white">{image.caption || image.alt}</figcaption>
            </figure>
          </div>
        </div>
      ) : null}
    </>
  );
}
