import { applyPayment, donationReceipt, fetchRazorpayPayment } from '@/lib/donation';
import { fail, json, text } from '@/lib/http';
import { paymentProvider } from '@/lib/payments';
import { updateSite } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orderId = text(body.orderId);
  const paymentId = text(body.paymentId);
  const reason = text(body.reason);
  if (!orderId) return fail('Missing payment attempt');
  const payment = paymentProvider() === 'razorpay' && paymentId ? await fetchRazorpayPayment(paymentId) : null;
  let receipt = null as ReturnType<typeof donationReceipt> | null;
  await updateSite((site) => {
    const row = site.donations.find((item) => item.orderId === orderId);
    if (!row || row.status === 'paid') return;
    applyPayment(row, payment, paymentId);
    row.status = 'failed';
    receipt = donationReceipt(
      row,
      'failed',
      reason || 'The payment was not completed. You have not been charged for a confirmed gift.',
    );
  });
  if (!receipt) return fail('This payment does not match an open donation', 404);
  return json({ ok: false, receipt });
}
