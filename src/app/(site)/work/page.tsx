import type { Metadata } from 'next';
import Link from 'next/link';
import { PROGRAM_ICONS } from '@/lib/icons';
import { getSite } from '@/lib/store';

const BANNER_PHOTO = '/images/banner_images/s-banner-health-check.jpeg';

export const metadata: Metadata = {
  title: 'Our work',
  description: 'How Navnikunj Foundation supports learning, health, families, skills, and neighbourhoods.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  const site = getSite();
  return (
    <main>
      <section className="relative isolate overflow-hidden text-white">
        <img src={BANNER_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/15 via-ink/45 to-ink/75" />
        <div className="shell relative flex min-h-[13rem] items-center py-12 md:min-h-[17rem] md:justify-end">
          <div className="max-w-lg md:text-right">
            <h1 className="heading-xl">Our Work</h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">Help that is specific, recorded, and close to home</p>
          </div>
        </div>
      </section>
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
