import { randomBytes } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/auth';
import { fail, json } from '@/lib/http';

const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return fail('Choose an image');
  const ext = TYPES[file.type];
  if (!ext) return fail('Use a JPG, PNG, WEBP, or GIF image');
  if (file.size > 5 * 1024 * 1024) return fail('Images must be 5 MB or smaller');
  const name = `${Date.now()}-${randomBytes(3).toString('hex')}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return json({ ok: true, url: `/uploads/${name}` });
}
