import { createHmac, timingSafeEqual } from 'crypto';
import { fail, json, text } from '@/lib/http';
import { updateSite } from '@/lib/store';

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!secret) return fail('Razorpay is not configured', 503);
  const body = await request.json().catch(() => ({}));
  const orderId = text(body.razorpay_order_id);
  const paymentId = text(body.razorpay_payment_id);
  const signature = text(body.razorpay_signature);
  if (!orderId || !paymentId || !signature) return fail('Missing payment confirmation');
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const valid = expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) {
    updateSite((site) => {
      const row = site.donations.find((item) => item.orderId === orderId);
      if (row) row.status = 'failed';
    });
    return fail('Payment signature did not match', 400);
  }
  updateSite((site) => {
    const row = site.donations.find((item) => item.orderId === orderId);
    if (row) {
      row.status = 'paid';
      row.paymentId = paymentId;
    }
  });
  return json({ ok: true });
}
