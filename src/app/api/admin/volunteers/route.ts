import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { createVolunteer, deleteVolunteer, updateVolunteer, volunteerRole, volunteerStatus } from '@/lib/records';

function flag(value: unknown) {
  return value === true || value === 'true' || value === 'on';
}

function fields(body: Record<string, unknown>) {
  return {
    name: text(body.name),
    email: text(body.email),
    phone: text(body.phone),
    city: text(body.city),
    skills: text(body.skills),
    availability: text(body.availability),
    role: volunteerRole(text(body.role)),
    title: text(body.title).slice(0, 160),
    image: text(body.image).slice(0, 500),
    status: volunteerStatus(text(body.status)),
    featured: flag(body.featured),
    notes: text(body.notes),
  };
}

export async function POST(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  try {
    const volunteer = await createVolunteer(fields(body));
    return json({ ok: true, volunteer });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The volunteer could not be saved.');
  }
}

export async function PATCH(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = text(body.id);
  if (!id) return fail('Choose a volunteer.');
  try {
    await updateVolunteer(id, fields(body));
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The volunteer could not be updated.');
  }
}

export async function DELETE(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a volunteer to remove.');
  await deleteVolunteer(id);
  return json({ ok: true });
}
