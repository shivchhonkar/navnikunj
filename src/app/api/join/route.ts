import { fail, json, text } from '@/lib/http';
import { createVolunteer, volunteerRole } from '@/lib/records';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = text(body.name).slice(0, 120);
  const email = text(body.email).slice(0, 160);
  const phone = text(body.phone).slice(0, 40);
  const message = text(body.notes).slice(0, 2000);
  if (!name || !phone) return fail('Name and phone are required.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Enter a valid email.');
  try {
    await createVolunteer({
      name,
      email,
      phone,
      city: text(body.city).slice(0, 80),
      skills: text(body.skills).slice(0, 200),
      availability: text(body.availability).slice(0, 120),
      role: volunteerRole(text(body.role)),
      title: '',
      image: '',
      status: 'applied',
      featured: false,
      notes: message,
    });
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The form could not be sent.');
  }
}
