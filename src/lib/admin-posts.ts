import type { PostKind } from '@/lib/types';

export const POST_SECTIONS: { href: string; kind: PostKind; label: string; hint: string; noun: string }[] = [
  { href: '/admin/posts/news', kind: 'news', label: 'News', hint: 'Short reports from programs and the community.', noun: 'news post' },
  { href: '/admin/posts/blog', kind: 'blog', label: 'Blogs', hint: 'Longer notes and stories.', noun: 'blog post' },
  { href: '/admin/posts/events', kind: 'event', label: 'Events', hint: 'Gatherings with a date and a place.', noun: 'event' },
];
