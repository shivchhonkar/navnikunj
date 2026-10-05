import type { Metadata } from 'next';
import Link from 'next/link';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { PROGRAM_ICONS } from '@/lib/icons';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Poverty alleviation, education and skill development, community health and nutrition, women and child welfare, environmental sustainability, and disaster relief.',
  alternates: { canonical: '/programs' },
};

export default async function ProgramsPage() {
  const site = await getSite();
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'programs')} />
      <div className="section shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
