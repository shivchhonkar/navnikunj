import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'navnikunj_admin';

function secret() {
  return process.env.ADMIN_SECRET || 'navnikunj-local-admin-secret';
}

export function adminToken() {
  return createHmac('sha256', secret()).update('navnikunj-admin').digest('hex');
}

export function isAdmin() {
  const value = cookies().get(COOKIE)?.value || '';
  const expected = adminToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function adminCookie() {
  return {
    name: COOKIE,
    value: adminToken(),
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}
