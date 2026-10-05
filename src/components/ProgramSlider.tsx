'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PROGRAM_ICONS } from '@/lib/icons';
import { programPhoto } from '@/lib/programs';
import type { Program } from '@/lib/types';

export function ProgramSlider({ programs, linkLabel = 'Learn More' }: { programs: Program[]; linkLabel?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const sync = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    setEdges({
      start: node.scrollLeft <= 8,
      end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    sync();
    const node = scroller.current;
    if (!node) return;
    node.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      node.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync, programs.length]);

  const move = (direction: number) => {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector('article');
    const gap = Number.parseFloat(window.getComputedStyle(node).columnGap || '0') || 0;
    const width = card ? card.getBoundingClientRect().width : node.clientWidth;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollBy({ left: direction * (width + gap), behavior: reduce ? 'auto' : 'smooth' });
  };

  if (!programs.length) return null;
  const sliding = !(edges.start && edges.end);

  return (
    <div className="shell mt-12">
      <div className="relative">
        {sliding ? (
          <>
            <button type="button" aria-label="Previous programs" disabled={edges.start} onClick={() => move(-1)} className="absolute left-1 top-24 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md hover:text-brand disabled:pointer-events-none disabled:opacity-0 sm:left-2">
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Next programs" disabled={edges.end} onClick={() => move(1)} className="absolute right-1 top-24 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md hover:text-brand disabled:pointer-events-none disabled:opacity-0 sm:right-2">
              <ChevronRight size={18} />
            </button>
          </>
        ) : null}
        <div ref={scroller} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Focus areas" role="region" aria-roledescription="carousel">
          {programs.map((program) => {
            const Icon = PROGRAM_ICONS[program.icon] || PROGRAM_ICONS.heart;
            const photo = programPhoto(program);
            return (
              <article key={program.id} className="card flex w-[88%] shrink-0 snap-start flex-col border border-line p-2.5 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
                <div className="relative">
                  {photo
                    ? <img src={photo} alt="" className="h-48 w-full rounded-2xl object-cover" />
                    : <div className="h-48 rounded-2xl bg-sand" />}
                  <span className="absolute -bottom-5 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-md">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-2.5 pb-3 pt-8">
                  <h3 className="text-lg leading-snug text-ink">{program.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{program.summary}</p>
                  {linkLabel ? (
                    <Link href={`/programs/${program.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">
                      {linkLabel} <ArrowRight size={14} />
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
