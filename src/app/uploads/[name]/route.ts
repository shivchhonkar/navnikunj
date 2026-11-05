import { readFile, stat } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const name = path.basename(params.name || '');
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (!/^[\w.-]+$/.test(name) || !TYPES[ext]) {
    return new NextResponse('Not found', { status: 404 });
  }

  const file = path.join(process.cwd(), 'public', 'uploads', name);
  try {
    const info = await stat(file);
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 });
    const body = new Uint8Array(await readFile(file));
    return new NextResponse(body, {
      headers: {
        'Content-Type': TYPES[ext],
        'Content-Length': String(body.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
