import { createHmac, timingSafeEqual } from 'crypto';
import { applyPayment, donationReceipt, fetchRazorpayPayment } from '@/lib/donation';
import { fail, json, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import type { DonationReceipt } from '@/lib/types';

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
  const payment = await fetchRazorpayPayment(paymentId);
  let receipt: DonationReceipt | null = null;
  await updateSite((site) => {
    const row = site.donations.find((item) => item.orderId === orderId);
    if (!row) return;
    applyPayment(row, payment, paymentId);
    row.status = valid ? 'paid' : 'failed';
    receipt = donationReceipt(
      row,
      valid ? 'paid' : 'failed',
      valid
        ? 'Your gift is confirmed. Thank you for standing with the foundation.'
        : 'The payment could not be confirmed. No gift was recorded as paid.',
    );
  });
  if (!receipt) return fail('This payment does not match an open donation', 404);
  if (!valid) return json({ ok: false, error: 'Payment signature did not match', receipt }, 400);
  return json({ ok: true, receipt });
}
