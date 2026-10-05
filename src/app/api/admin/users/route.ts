import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { createUser, deleteUser, updateUser } from '@/lib/records';
import type { UserRole } from '@/lib/types';

function roleOf(value: string): UserRole {
  return value === 'editor' ? 'editor' : 'admin';
}

async function adminOnly() {
  const user = await currentUser();
  if (!user) return { user: null, response: fail('Sign in required', 401) };
  if (user.role !== 'admin') return { user: null, response: fail('Only an administrator can manage users.', 403) };
  return { user, response: null };
}

export async function POST(request: Request) {
  const { user, response } = await adminOnly();
  if (!user) return response;
  const body = await request.json().catch(() => ({}));
  try {
    const saved = await createUser({
      username: text(body.username),
      password: text(body.password),
      displayName: text(body.displayName),
      email: text(body.email),
      role: roleOf(text(body.role)),
    });
    return json({ ok: true, user: saved });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The user could not be saved.');
  }
}

export async function PATCH(request: Request) {
  const { user, response } = await adminOnly();
  if (!user) return response;
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a user.');
  try {
    await updateUser(id, user.id, {
      displayName: text(body.displayName),
      email: text(body.email),
      role: roleOf(text(body.role)),
      active: Boolean(body.active),
      password: text(body.password),
    });
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The user could not be updated.');
  }
}

export async function DELETE(request: Request) {
  const { user, response } = await adminOnly();
  if (!user) return response;
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a user to remove.');
  try {
    await deleteUser(id, user.id);
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The user could not be removed.');
  }
}
