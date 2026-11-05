import { randomBytes } from 'crypto';
import { isAdmin } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import type { GalleryImage } from '@/lib/types';

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

export async function PUT(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a photograph to edit');

  let updated: GalleryImage | null = null;
  await updateSite((site) => {
    const image = site.gallery.find((item) => item.id === id);
    if (!image) return;
    const src = text(body.src);
    if (src) image.src = src;
    image.alt = text(body.alt) || 'Gallery photograph';
    image.caption = text(body.caption);
    updated = { ...image };
  });

  if (!updated) return fail('Photograph not found', 404);
  return json({ ok: true, image: updated });
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
