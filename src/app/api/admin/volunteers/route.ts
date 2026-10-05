import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { createVolunteer, deleteVolunteer, updateVolunteer, volunteerStatus } from '@/lib/records';

export async function POST(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  try {
    const volunteer = await createVolunteer({
      name: text(body.name),
      email: text(body.email),
      phone: text(body.phone),
      city: text(body.city),
      skills: text(body.skills),
      availability: text(body.availability),
      status: volunteerStatus(text(body.status)),
      notes: text(body.notes),
    });
    return json({ ok: true, volunteer });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The volunteer could not be saved.');
  }
}

export async function PATCH(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a volunteer.');
  try {
    await updateVolunteer(id, {
      name: text(body.name),
      email: text(body.email),
      phone: text(body.phone),
      city: text(body.city),
      skills: text(body.skills),
      availability: text(body.availability),
      status: volunteerStatus(text(body.status)),
      notes: text(body.notes),
    });
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
