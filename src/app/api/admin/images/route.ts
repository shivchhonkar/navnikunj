import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { deleteImage, updateImage } from '@/lib/records';

export async function PATCH(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose an image.');
  try {
    await updateImage(id, text(body.alt), text(body.caption));
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The image could not be updated.');
  }
}

export async function DELETE(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose an image to remove.');
  await deleteImage(id);
  return json({ ok: true });
}
