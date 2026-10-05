import { randomBytes } from 'crypto';
import { isAdmin } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { updateSite } from '@/lib/store';

export async function POST(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const src = text(body.src);
  if (!src) return fail('Choose an image first');
  const image = {
    id: text(body.id) || `img_${randomBytes(4).toString('hex')}`,
    src,
    alt: text(body.alt) || 'Gallery photograph',
    caption: text(body.caption),
  };
  await updateSite((site) => {
    site.gallery.unshift(image);
  });
  return json({ ok: true, image });
}

export async function DELETE(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  await updateSite((site) => {
    site.gallery = site.gallery.filter((item) => item.id !== id);
  });
  return json({ ok: true });
}
