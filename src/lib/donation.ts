import type { Donation, DonationReceipt } from '@/lib/types';

const MODES: Record<string, string> = {
  card: 'Card',
  netbanking: 'Net banking',
  wallet: 'Wallet',
  upi: 'UPI',
  emi: 'EMI',
  paylater: 'Pay later',
};

export function paymentMode(method: string) {
  const key = method.trim().toLowerCase();
  if (!key) return '';
  return MODES[key] || method;
}

export async function fetchRazorpayPayment(paymentId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!paymentId || !keyId || !keySecret) return null;
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!response.ok) return null;
    const payment = await response.json().catch(() => null);
    if (!payment || typeof payment !== 'object') return null;
    return payment as { method?: string; created_at?: number };
  } catch {
    return null;
  }
}

export function applyPayment(row: Donation, payment: { method?: string; created_at?: number } | null, paymentId: string) {
  if (paymentId) row.paymentId = paymentId;
  const mode = paymentMode(payment?.method || '');
  if (mode) row.method = mode;
  if (payment?.created_at) row.at = new Date(payment.created_at * 1000).toISOString();
}

export function donationReceipt(row: Donation, status: 'paid' | 'failed', message: string): DonationReceipt {
  return {
    status,
    name: row.name,
    email: row.email,
    phone: row.phone,
    pan: row.pan,
    address: row.address,
    country: row.country,
    amount: row.amount,
    at: row.at,
    paymentId: row.paymentId,
    method: row.method || (status === 'paid' ? 'Razorpay' : ''),
    message,
  };
}
