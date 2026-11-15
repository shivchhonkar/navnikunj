import { Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-card border border-line bg-transparent p-6">
      <Quote className="text-brand" size={22} aria-hidden />
      <blockquote className="lead mt-4 flex-1 text-sm">“{item.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {item.image ? (
          <img src={item.image} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sand text-sm font-semibold text-brand" aria-hidden>
            {item.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span>
          <span className="block font-semibold text-ink">{item.name}</span>
          {item.role ? <span className="block text-sm text-muted">{item.role}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
