import Link from 'next/link';
import type { Post } from '@/lib/types';

export function formatPostDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const KIND_LABEL = { news: 'News', blog: 'Blog', event: 'Event' };

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80',
];

export function postPhoto(post: { image: string; title: string }) {
  return post.image || FALLBACK_PHOTOS[post.title.length % FALLBACK_PHOTOS.length];
}

export function PostCard({ post }: { post: Post }) {
  const photo = postPhoto(post);
  return (
    <article className="card flex h-full flex-col overflow-hidden border border-line">
      <div className="relative h-44">
        <img src={photo} alt="" className="h-full w-full object-cover" />
        <p className="absolute left-3 top-3 rounded-full bg-paper px-2.5 py-1 text-[11px] uppercase tracking-wide text-brandDark">{KIND_LABEL[post.kind]}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted">{formatPostDate(post.date)}{post.location ? ` · ${post.location}` : ''}</p>
        <h3 className="mt-2 text-lg leading-snug text-ink">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{post.excerpt}</p>
        <Link href={`/news/${post.slug}`} className="mt-4 inline-flex text-sm text-brand hover:text-brandDark">Read more</Link>
      </div>
    </article>
  );
}
