import { NextResponse } from 'next/server';
import { siteUrl } from '@/lib/store';

function resultUrl(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id') || '';
  return new URL(`/donate/result?order_id=${encodeURIComponent(orderId)}`, siteUrl());
}

export function GET(request: Request) {
  return NextResponse.redirect(resultUrl(request));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let orderId = url.searchParams.get('order_id') || '';
  if (!orderId) {
    const body = await request.formData().catch(() => null);
    orderId = body?.get('order_id')?.toString() || '';
  }
  return NextResponse.redirect(new URL(`/donate/result?order_id=${encodeURIComponent(orderId)}`, siteUrl()));
}
