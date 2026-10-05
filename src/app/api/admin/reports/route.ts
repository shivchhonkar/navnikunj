import { currentUser } from '@/lib/auth';
import { fail, json, text } from '@/lib/http';
import { createReport, deleteReport, setReportStatus } from '@/lib/records';
import type { ReportKind } from '@/lib/types';

const KINDS = new Set<ReportKind>(['overview', 'donations', 'donors', 'volunteers', 'events']);

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const kind = text(body.kind);
  try {
    const report = await createReport({
      title: text(body.title),
      kind: KINDS.has(kind as ReportKind) ? kind as ReportKind : 'overview',
      periodStart: text(body.periodStart),
      periodEnd: text(body.periodEnd),
      createdBy: user.id,
    });
    return json({ ok: true, report });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The report could not be saved.');
  }
}

export async function PATCH(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a report.');
  try {
    await setReportStatus(id, text(body.status) === 'published' ? 'published' : 'draft');
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'The report could not be updated.');
  }
}

export async function DELETE(request: Request) {
  if (!await currentUser()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const id = text(body.id);
  if (!id) return fail('Choose a report to remove.');
  await deleteReport(id);
  return json({ ok: true });
}
