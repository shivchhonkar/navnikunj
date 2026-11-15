import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { createTestimonial, deleteTestimonial, reorderTestimonials, updateTestimonial } from '@/lib/records';

function flag(value: unknown) {
  return value === true || value === 'true' || value === 'on';
}

function fields(body: Record<string, unknown>) {
  return {
    name: text(body.name).slice(0, 120),
    role: text(body.role).slice(0, 120),
    quote: text(body.quote).slice(0, 2000),
    image: text(body.image).slice(0, 500),
    published: flag(body.published),
  };
}

export async function POST(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  try {
    const testimonial = await createTestimonial(fields(body));
    return json({ ok: true, testimonial });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The testimonial could not be saved.');
  }
}

export async function PATCH(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (Array.isArray(body.order)) {
    const order = body.order.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
    if (!order.length) return fail('Choose the testimonials to reorder.');
    await reorderTestimonials(order);
    return json({ ok: true });
  }
  const id = text(body.id);
  if (!id) return fail('Choose a testimonial.');
  try {
    const testimonial = await updateTestimonial(id, fields(body));
    return json({ ok: true, testimonial });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The testimonial could not be updated.');
  }
}

export async function DELETE(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a testimonial to remove.');
  await deleteTestimonial(id);
  return json({ ok: true });
}
