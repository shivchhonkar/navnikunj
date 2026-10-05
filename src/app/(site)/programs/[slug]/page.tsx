import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROGRAM_ICONS } from '@/lib/icons';
import { getSite } from '@/lib/store';

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const program = (await getSite()).programs.find((item) => item.slug === params.slug);
  if (!program) return { title: 'Program' };
  return { title: program.title, description: program.summary, alternates: { canonical: `/programs/${program.slug}` } };
}

export default async function ProgramPage({ params }: Params) {
  const program = (await getSite()).programs.find((item) => item.slug === params.slug);
  if (!program) notFound();
  const Icon = PROGRAM_ICONS[program.icon] || PROGRAM_ICONS.heart;
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link href="/programs" className="text-sm font-semibold text-brand">All programs</Link>
      <div className="mt-4 inline-flex rounded-xl bg-rose-50 p-3 text-brand"><Icon size={22} /></div>
      <h1 className="mt-4 text-4xl sm:text-5xl">{program.title}</h1>
      <p className="mt-4 text-lg leading-8 text-stone-700">{program.body}</p>
      <Link href="/donate" className="mt-8 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">Support this work</Link>
    </main>
  );
}
