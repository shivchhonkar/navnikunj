import { cookies } from 'next/headers';
import { adminCookie } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { verifyPassword } from '@/lib/password';
import { findUserByUsername } from '@/lib/records';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = text(body.username).toLowerCase();
  const password = text(body.password);
  const user = await findUserByUsername(username);
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return fail('Check the username and password.');
  }
  const cookie = adminCookie(user.id);
  cookies().set(cookie.name, cookie.value, cookie.options);
  return json({ ok: true });
}

export async function DELETE() {
  cookies().delete(adminCookie('').name);
  return json({ ok: true });
}
