import type { Metadata } from 'next';
import Link from 'next/link';
import { PageBanner } from '@/components/PageBanner';
import { PostCard } from '@/components/PostCard';
import { bannerFor } from '@/lib/banners';
import { getSite } from '@/lib/store';
import type { PostKind } from '@/lib/types';

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

export default async function NewsPage({ searchParams }: { searchParams: { kind?: string } }) {
  const kind = FILTERS.some((item) => item.kind === searchParams.kind) ? searchParams.kind as PostKind : undefined;
  const site = await getSite();
  const posts = site.posts
    .filter((post) => post.published && (!kind || post.kind === kind))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'news')} />

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
