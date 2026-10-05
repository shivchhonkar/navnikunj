import { randomBytes } from 'crypto';
import { isAdmin } from '@/lib/auth';
import { fail, json, slugify, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import type { PostKind } from '@/lib/types';

const KINDS = new Set(['blog', 'news', 'event']);

export async function POST(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const title = text(body.title);
  if (!title) return fail('Title is required');
  const kind: PostKind = KINDS.has(text(body.kind)) ? text(body.kind) as PostKind : 'news';
  const id = `post_${randomBytes(4).toString('hex')}`;
  await updateSite((site) => {
    let slug = slugify(title);
    if (site.posts.some((item) => item.slug === slug)) slug = `${slug}-${id.slice(-4)}`;
    site.posts.unshift({
      id,
      slug,
      kind,
      title,
      excerpt: text(body.excerpt),
      body: text(body.body),
      image: text(body.image),
      date: text(body.date) || new Date().toISOString().slice(0, 10),
      location: text(body.location),
      keywords: text(body.keywords),
      published: Boolean(body.published),
    });
  });
  return json({ ok: true, id });
}
