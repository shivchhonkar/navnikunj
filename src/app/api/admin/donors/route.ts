import { randomBytes } from 'crypto';
import { isAdmin } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { updateSite } from '@/lib/store';

const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export async function POST(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const name = text(body.name);
  const phone = text(body.phone);
  const pan = text(body.pan).toUpperCase();
  const address = text(body.address);
  const country = text(body.country);
  const amount = Number(body.amount);
  if (!name || !phone) return fail('Name and phone are required');
  if (!PAN.test(pan)) return fail('Enter a valid PAN, such as ABCDE1234F');
  if (!address || !country) return fail('Address and country are required');
  if (!Number.isFinite(amount) || amount < 1) return fail('Enter an amount of at least ₹1');
  const donor = {
    id: `dn_${randomBytes(4).toString('hex')}`,
    name,
    email: text(body.email),
    phone,
    pan,
    address,
    country,
    amount,
    orderId: '',
    paymentId: '',
    status: 'paid' as const,
    at: new Date().toISOString(),
  };
  updateSite((site) => {
    site.donations.unshift(donor);
  });
  return json({ ok: true, donor });
}

export async function DELETE(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a donor to remove');
  updateSite((site) => {
    site.donations = site.donations.filter((item) => item.id !== id);
  });
  return json({ ok: true });
}
