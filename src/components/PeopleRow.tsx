'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type PublicCard = { id: string; name: string; title: string; image: string };

function PersonCard({ person }: { person: PublicCard }) {
  const initial = person.name.slice(0, 1).toUpperCase();
  return (
    <article className="w-52 shrink-0 snap-start text-center">
      <div className="mx-auto h-52 w-52 overflow-hidden rounded-full bg-sand">
        {person.image ? (
          <img src={person.image} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <span className="grid h-full place-items-center text-5xl font-semibold text-brand" aria-hidden>{initial}</span>
        )}
      </div>
      <h4 className="mt-5 text-lg font-light leading-snug text-ink">{person.name}</h4>
      {person.title ? <p className="mt-1 text-sm font-weight-large leading-5 text-muted">{person.title}</p> : null}
    </article>
  );
}

export function PeopleRow({ people, label }: { people: PublicCard[]; label: string }) {
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
  }, [sync, people.length]);

  const move = (direction: number) => {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector('article');
    const gap = Number.parseFloat(window.getComputedStyle(node).columnGap || '0') || 0;
    const width = card ? card.getBoundingClientRect().width : node.clientWidth;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollBy({ left: direction * (width + gap), behavior: reduce ? 'auto' : 'smooth' });
  };

  const sliding = !(edges.start && edges.end);

  const arrow = 'mt-[5.25rem] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md hover:text-brand disabled:pointer-events-none disabled:opacity-30';

  return (
    <div className="mt-10 flex items-start gap-4">
      {sliding ? (
        <button type="button" aria-label={`Previous ${label}`} disabled={edges.start} onClick={() => move(-1)} className={arrow}>
          <ChevronLeft size={18} />
        </button>
      ) : null}
      <div ref={scroller} className={`flex min-w-0 flex-1 snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${sliding ? '' : 'justify-center'}`} role="region" aria-roledescription="carousel" aria-label={label}>
        {people.map((person) => <PersonCard key={person.id} person={person} />)}
      </div>
      {sliding ? (
        <button type="button" aria-label={`Next ${label}`} disabled={edges.end} onClick={() => move(1)} className={arrow}>
          <ChevronRight size={18} />
        </button>
      ) : null}
    </div>
  );
}
