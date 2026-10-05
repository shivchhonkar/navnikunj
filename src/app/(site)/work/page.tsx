import type { Metadata } from 'next';
import Link from 'next/link';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { PROGRAM_ICONS } from '@/lib/icons';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Our work',
  description: 'How Navnikunj Foundation supports poverty alleviation, education, health, women and children, the environment, and disaster relief.',
  alternates: { canonical: '/work' },
};

export default async function WorkPage() {
  const site = await getSite();
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'work')} />
      <div className="section shell">
        <p className="max-w-3xl leading-7 text-muted">The foundation does not try to do everything. It keeps a short list of programs, publishes what is happening, and uses the donation record to match support to that work.</p>
        <div className="mt-10 space-y-4">
          {site.programs.map((program) => {
            const Icon = PROGRAM_ICONS[program.icon] || PROGRAM_ICONS.heart;
            return (
              <article key={program.id} className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[auto_1fr]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-brand"><Icon size={22} /></span>
                <div>
                  <h2 className="text-2xl">{program.title}</h2>
                  <p className="mt-2 leading-7 text-stone-600">{program.body}</p>
                  <Link href={`/programs/${program.slug}`} className="mt-3 inline-flex text-sm font-semibold text-brand">Program page</Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
