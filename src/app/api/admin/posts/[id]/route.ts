import { isAdmin } from '@/lib/auth';
import { fail, json, slugify, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import type { PostKind } from '@/lib/types';

const KINDS = new Set(['blog', 'news', 'event']);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  let found = false;
  updateSite((site) => {
    const post = site.posts.find((item) => item.id === params.id);
    if (!post) return;
    found = true;
    if ('title' in body && text(body.title)) {
      post.title = text(body.title);
      const next = slugify(post.title);
      if (!site.posts.some((item) => item.id !== post.id && item.slug === next)) post.slug = next;
    }
    if ('excerpt' in body) post.excerpt = text(body.excerpt);
    if ('body' in body) post.body = text(body.body);
    if ('image' in body) post.image = text(body.image);
    if ('date' in body) post.date = text(body.date);
    if ('location' in body) post.location = text(body.location);
    if ('keywords' in body) post.keywords = text(body.keywords);
    if ('kind' in body && KINDS.has(text(body.kind))) post.kind = text(body.kind) as PostKind;
    if ('published' in body) post.published = Boolean(body.published);
  });
  if (!found) return fail('Post not found', 404);
  return json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return fail('Sign in required', 401);
  updateSite((site) => {
    site.posts = site.posts.filter((item) => item.id !== params.id);
  });
  return json({ ok: true });
}
