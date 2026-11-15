import { fail, json, text } from '@/lib/http';
import { collaborationKind, createCollaboration } from '@/lib/records';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    await createCollaboration({
      name: text(body.name).slice(0, 120),
      organization: text(body.organization).slice(0, 160),
      email: text(body.email).slice(0, 160),
      phone: text(body.phone).slice(0, 40),
      kind: collaborationKind(text(body.kind)),
      message: text(body.message).slice(0, 4000),
      status: 'new',
    });
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The note could not be sent.');
  }
}
