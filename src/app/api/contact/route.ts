import { fail, json, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = text(body.name);
  const email = text(body.email);
  const phone = text(body.phone);
  const message = text(body.message);
  if (!name || !email || !phone || !message) return fail('Name, email, phone, and message are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Enter a valid email');
  await updateSite((site) => {
    site.messages.unshift({
      id: `msg_${randomBytes(4).toString('hex')}`,
      name,
      email,
      phone,
      message,
      at: new Date().toISOString(),
    });
    site.messages = site.messages.slice(0, 200);
  });
  return json({ ok: true });
}
