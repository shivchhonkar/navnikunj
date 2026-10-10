import { createHmac, timingSafeEqual } from 'crypto';
import { confirmCashfreeOrder } from '@/lib/cashfree';
import { applyPayment, donationReceipt, fetchRazorpayPayment } from '@/lib/donation';
import { fail, json, text } from '@/lib/http';
import { paymentProvider } from '@/lib/payments';
import { updateSite } from '@/lib/store';
import type { DonationReceipt } from '@/lib/types';

async function verifyRazorpay(body: Record<string, unknown>) {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!secret) return fail('Razorpay is not configured', 503);
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (text(body.razorpay_order_id) || text(body.razorpay_payment_id) || text(body.razorpay_signature)) {
    if (paymentProvider() !== 'razorpay') return fail('Razorpay is turned off. Set PAYMENT_PROVIDER=razorpay to use it.', 403);
    return verifyRazorpay(body);
  }
  const confirmed = await confirmCashfreeOrder(text(body.orderId));
  if (!confirmed.receipt) return fail(confirmed.error || 'This payment could not be confirmed', confirmed.pending ? 409 : 404);
  if (!confirmed.ok) return json({ ok: false, error: confirmed.error, receipt: confirmed.receipt }, 400);
  return json({ ok: true, receipt: confirmed.receipt });
}
