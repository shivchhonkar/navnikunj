import type { Metadata } from 'next';
import Link from 'next/link';
import { PROGRAM_ICONS } from '@/lib/icons';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Learning support, community health, family relief, skills for work, and green neighbourhoods.',
  alternates: { canonical: '/programs' },
};

export default function ProgramsPage() {
  const site = getSite();
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h1 className="text-4xl sm:text-5xl">Programs</h1>
      <p className="mt-3 max-w-2xl text-stone-600">Choose a program to read what it covers and how to support it.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.programs.map((program) => {
          const Icon = PROGRAM_ICONS[program.icon] || PROGRAM_ICONS.heart;
          return (
            <article key={program.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <Icon className="text-brand" size={22} />
              <h2 className="mt-3 text-2xl">{program.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{program.summary}</p>
              <Link href={`/programs/${program.slug}`} className="mt-4 inline-flex text-sm font-semibold text-brand">Learn more</Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
