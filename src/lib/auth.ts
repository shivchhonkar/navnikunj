import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { findUserById } from './records';

const COOKIE = 'navnikunj_admin';

function secret() {
  return process.env.ADMIN_SECRET || 'navnikunj-local-admin-secret';
}

function sign(userId: string) {
  return createHmac('sha256', secret()).update(userId).digest('hex');
}

export function adminUserId() {
  const value = cookies().get(COOKIE)?.value || '';
  const split = value.lastIndexOf('.');
  if (split <= 0) return '';
  const userId = value.slice(0, split);
  const signature = value.slice(split + 1);
  const expected = sign(userId);
  if (signature.length !== expected.length) return '';
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return '';
  return userId;
}

export function isAdmin() {
  return Boolean(adminUserId());
}

export async function currentUser() {
  const id = adminUserId();
  if (!id) return null;
  return findUserById(id);
}

export function adminCookie(userId: string) {
  return {
    name: COOKIE,
    value: `${userId}.${sign(userId)}`,
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}
