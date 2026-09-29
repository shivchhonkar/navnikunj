import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PROGRAM_ICONS } from '@/lib/icons';
import type { Program } from '@/lib/types';

const PHOTOS: Record<string, string> = {
  'learning-support': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
  'community-health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
  'family-relief': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80',
  'skills-for-work': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  'green-neighbourhoods': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
};

export function ProgramSlider({ programs }: { programs: Program[] }) {
  if (!programs.length) return null;

  return (
    <div className="shell mt-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {programs.map((program) => {
          const Icon = PROGRAM_ICONS[program.icon] || PROGRAM_ICONS.heart;
          const photo = PHOTOS[program.slug];
          return (
            <article key={program.id} className="card flex h-full flex-col border border-line p-2.5">
              <div className="relative">
                {photo
                  ? <img src={photo} alt="" className="h-36 w-full rounded-2xl object-cover" />
                  : <div className="h-36 rounded-2xl bg-sand" />}
                <span className="absolute -bottom-5 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-md">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2.5 pb-3 pt-8">
                <h3 className="text-base leading-snug text-ink">{program.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">{program.summary}</p>
                <Link href={`/programs/${program.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
