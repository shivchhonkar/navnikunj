import { randomBytes } from 'crypto';
import { fail, json, text } from '@/lib/http';
import { razorpayReady, updateSite } from '@/lib/store';

export async function POST(request: Request) {
  if (!razorpayReady()) return fail('Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local', 503);
  const body = await request.json().catch(() => ({}));
  const name = text(body.name);
  const email = text(body.email);
  const phone = text(body.phone);
  const pan = text(body.pan).toUpperCase();
  const address = text(body.address);
  const country = text(body.country);
  const rupees = Number(body.amount);
  if (!name || !email || !phone) return fail('Name, email, and phone are required');
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return fail('Enter a valid PAN, such as ABCDE1234F');
  if (!address || !country) return fail('Address and country are required');
  if (!Number.isFinite(rupees) || rupees < 1 || rupees > 1000000) return fail('Enter an amount between ₹1 and ₹10,00,000');
  const amount = Math.round(rupees * 100);
  const receipt = `dn_${randomBytes(4).toString('hex')}`;
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt }),
  });
  const order = await response.json().catch(() => ({}));
  if (!response.ok || !order.id) return fail(order.error?.description || 'Razorpay could not open an order', 502);
  updateSite((site) => {
    site.donations.unshift({
      id: receipt,
      name,
      email,
      phone,
      pan,
      address,
      country,
      amount: rupees,
      orderId: order.id,
      paymentId: '',
      method: '',
      status: 'created',
      at: new Date().toISOString(),
    });
  });
  return json({ ok: true, orderId: order.id, amount, currency: 'INR', keyId });
}
