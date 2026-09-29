export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function fail(error: string, status = 400) {
  return json({ ok: false, error }, status);
}

export function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function slugify(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return slug || 'item';
}
