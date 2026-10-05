'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { HeroSlide } from '@/lib/types';

const FALLBACK_PHOTO = '/images/banner_images/banner-poor-childrens.jpeg';

export function HeroBanner({ eyebrow, slides }: { eyebrow: string; slides: HeroSlide[] }) {
  const items = slides.length ? slides : [{ id: 'hero_1', title: '', text: '', image: FALLBACK_PHOTO }];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const many = items.length > 1;
  const current = Math.min(index, items.length - 1);
  const slide = items[current];

  useEffect(() => {
    if (!many || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % items.length), 7000);
    return () => window.clearInterval(timer);
  }, [many, paused, items.length]);

  return (
    <section className="relative isolate overflow-hidden" aria-roledescription={many ? 'carousel' : undefined} aria-label="Home banner" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((item, itemIndex) => {
        const photo = item.image || FALLBACK_PHOTO;
        const visible = itemIndex === current;
        return (
          <div key={item.id} className={`absolute inset-0 transition-opacity duration-700 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!visible}>
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <img src={photo} alt="" className="hero-blur absolute inset-0 h-full w-full object-cover" />
          </div>
        );
      })}
      <div className="hero-wash absolute inset-0" />
      <div className="shell relative flex min-h-[16rem] items-center py-10 md:min-h-[20rem]">
        <div className="max-w-xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="heading-xl mt-5 max-w-lg text-ink">{slide.title}</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-ink/80 sm:text-lg">{slide.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/donate" className="btn btn-brand">
              Support our mission <ArrowRight size={16} />
            </Link>
            <Link href="/about" className="btn btn-line">Learn more</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
