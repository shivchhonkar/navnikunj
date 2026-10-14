import { NextResponse } from 'next/server';

function resultRedirect(request: Request, orderId = '') {
  const url = new URL(request.url);
  const id = orderId || url.searchParams.get('order_id') || '';
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `/donate/result?order_id=${encodeURIComponent(id)}` },
  });
}

export function GET(request: Request) {
  return resultRedirect(request);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let orderId = url.searchParams.get('order_id') || '';
  if (!orderId) {
    const body = await request.formData().catch(() => null);
    orderId = body?.get('order_id')?.toString() || '';
  }
  return resultRedirect(request, orderId);
}
