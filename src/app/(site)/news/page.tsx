import type { Metadata } from 'next';
import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
import { getSite } from '@/lib/store';
import type { PostKind } from '@/lib/types';

const BANNER_PHOTO = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2000&q=80';

export const metadata: Metadata = {
  title: 'News and updates',
  description: 'News, blog notes, and events from Navnikunj Foundation.',
  alternates: { canonical: '/news' },
};

const FILTERS: { href: string; label: string; kind?: PostKind }[] = [
  { href: '/news', label: 'All' },
  { href: '/news?kind=news', label: 'News' },
  { href: '/news?kind=blog', label: 'Blog' },
  { href: '/news?kind=event', label: 'Events' },
];

export default function NewsPage({ searchParams }: { searchParams: { kind?: string } }) {
  const kind = FILTERS.some((item) => item.kind === searchParams.kind) ? searchParams.kind as PostKind : undefined;
  const posts = getSite().posts
    .filter((post) => post.published && (!kind || post.kind === kind))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main>
      <section className="relative isolate overflow-hidden text-white">
        <img src={BANNER_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/15 via-ink/45 to-ink/75" />
        <div className="shell relative flex min-h-[13rem] items-center py-12 md:min-h-[17rem] md:justify-end">
          <div className="max-w-lg md:text-right">
            <h1 className="heading-xl">News & Updates</h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">Stories, notes, and upcoming gatherings</p>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const active = (item.kind || '') === (kind || '');
            return (
              <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-sm ${active ? 'bg-brand text-white' : 'border border-line bg-paper text-ink hover:border-brand'}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
        {!posts.length && <p className="mt-8 text-sm text-muted">Nothing published in this section yet.</p>}
      </section>
    </main>
  );
}
