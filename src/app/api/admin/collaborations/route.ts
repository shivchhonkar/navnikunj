import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { collaborationStatus, deleteCollaboration, updateCollaborationStatus } from '@/lib/records';

export async function PATCH(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a request.');
  try {
    await updateCollaborationStatus(id, collaborationStatus(text(body.status)));
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The request could not be updated.');
  }
}

export async function DELETE(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a request to remove.');
  await deleteCollaboration(id);
  return json({ ok: true });
}
