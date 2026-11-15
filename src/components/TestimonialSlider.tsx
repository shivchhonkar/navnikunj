'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TestimonialCard } from '@/components/TestimonialCard';
import type { Testimonial } from '@/lib/types';

export function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const sync = () => {
      setPerView(window.matchMedia('(min-width: 768px)').matches ? 2 : 1);
      setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const max = Math.max(testimonials.length - perView, 0);

  useEffect(() => {
    setIndex((current) => Math.min(current, max));
  }, [max]);

  useEffect(() => {
    if (paused || reduce || max === 0) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= max ? 0 : current + 1));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, reduce, max]);

  if (!testimonials.length) return null;

  const step = (direction: number) => {
    setIndex((current) => {
      const next = current + direction;
      if (next < 0) return max;
      if (next > max) return 0;
      return next;
    });
  };

  const sliding = max > 0;

  return (
    <div
      className="relative mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {sliding ? (
        <>
          <button type="button" aria-label="Previous testimonial" onClick={() => step(-1)} className="absolute left-1 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md hover:text-brand sm:-left-3">
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Next testimonial" onClick={() => step(1)} className="absolute right-1 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md hover:text-brand sm:-right-3">
            <ChevronRight size={18} />
          </button>
        </>
      ) : null}
      <div className="overflow-hidden px-1" role="region" aria-roledescription="carousel" aria-label="Testimonials">
        <div
          className={`flex w-full gap-5 ${reduce ? '' : 'transition-transform duration-700 ease-in-out'}`}
          style={{ transform: `translateX(calc(${-index} * (100% + 1.25rem) / ${perView}))` }}
        >
          {testimonials.map((item) => (
            <div key={item.id} className="min-w-0" style={{ flex: `0 0 calc((100% - ${(perView - 1) * 1.25}rem) / ${perView})` }}>
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
