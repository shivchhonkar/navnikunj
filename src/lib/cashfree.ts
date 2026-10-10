import { donationReceipt, paymentMode } from '@/lib/donation';
import { cashfreeMode, cashfreeReady } from '@/lib/payments';
import { siteUrl, updateSite } from '@/lib/store';
import type { DonationReceipt } from '@/lib/types';

const API_VERSION = '2023-08-01';

type CashfreeOrder = {
  order_id?: string;
  order_status?: string;
  order_amount?: number;
  payment_session_id?: string;
  message?: string;
};

type CashfreePayment = {
  cf_payment_id?: string | number;
  payment_status?: string;
  payment_group?: string;
};

function cashfreeBase() {
  return cashfreeMode() === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

function cashfreeHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': process.env.CASHFREE_APP_ID || '',
    'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
  };
}

export function cashfreePhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 ? digits : '';
}

export async function createCashfreeOrder(input: { orderId: string; amount: number; name: string; email: string; phone: string }) {
  const response = await fetch(`${cashfreeBase()}/orders`, {
    method: 'POST',
    headers: cashfreeHeaders(),
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: 'INR',
      order_note: 'Donation to Navnikunj Foundation',
      customer_details: {
        customer_id: `cust_${input.orderId}`,
        customer_name: input.name,
        customer_email: input.email,
        customer_phone: input.phone,
      },
      order_meta: {
        return_url: `${siteUrl()}/api/donate/cashfree/return?order_id={order_id}`,
      },
    }),
  });
  const order = await response.json().catch(() => ({})) as CashfreeOrder;
  if (!response.ok || !order.payment_session_id) {
    return { ok: false as const, error: order.message || 'Cashfree could not open the payment' };
  }
  return { ok: true as const, paymentSessionId: order.payment_session_id, mode: cashfreeMode() };
}

async function fetchCashfreeOrder(orderId: string) {
  const response = await fetch(`${cashfreeBase()}/orders/${encodeURIComponent(orderId)}`, { headers: cashfreeHeaders() });
  if (!response.ok) return null;
  const order = await response.json().catch(() => null) as CashfreeOrder | null;
  return order?.order_id ? order : null;
}

async function fetchCashfreePayments(orderId: string) {
  const response = await fetch(`${cashfreeBase()}/orders/${encodeURIComponent(orderId)}/payments`, { headers: cashfreeHeaders() });
  if (!response.ok) return [];
  const payments = await response.json().catch(() => []);
  if (Array.isArray(payments)) return payments as CashfreePayment[];
  if (payments && Array.isArray(payments.data)) return payments.data as CashfreePayment[];
  return [];
}

export async function confirmCashfreeOrder(orderId: string): Promise<{ ok: boolean; pending?: boolean; error?: string; receipt?: DonationReceipt }> {
  if (!orderId) return { ok: false, error: 'Missing payment confirmation' };
  if (!cashfreeReady()) return { ok: false, error: 'Cashfree is not configured' };
  const order = await fetchCashfreeOrder(orderId);
  if (!order) return { ok: false, error: 'Cashfree could not confirm this payment' };
  const payments = await fetchCashfreePayments(orderId);
  const success = payments.find((item) => item.payment_status === 'SUCCESS');
  const failedPayment = payments.find((item) => item.payment_status === 'FAILED' || item.payment_status === 'CANCELLED' || item.payment_status === 'USER_DROPPED');
  let receipt: DonationReceipt | undefined;
  let missing = false;
  let pending = false;
  await updateSite((site) => {
    const row = site.donations.find((item) => item.orderId === orderId);
    if (!row) {
      missing = true;
      return;
    }
    if (row.status === 'paid') {
      receipt = donationReceipt(row, 'paid', 'Your gift is confirmed. Thank you for standing with the foundation.');
      return;
    }
    const paid = order.order_status === 'PAID' || Boolean(success);
    if (!paid && order.order_status === 'ACTIVE' && !failedPayment) {
      pending = true;
      return;
    }
    const charged = Number(order.order_amount);
    if (paid && Number.isFinite(charged) && Math.abs(charged - row.amount) > 0.01) {
      row.status = 'failed';
      receipt = donationReceipt(row, 'failed', 'The paid amount did not match this donation. No gift was recorded as paid.');
      return;
    }
    const payment = success || failedPayment;
    if (payment?.cf_payment_id) row.paymentId = String(payment.cf_payment_id);
    row.method = paymentMode(payment?.payment_group || '') || (paid ? 'Cashfree' : row.method);
    row.status = paid ? 'paid' : 'failed';
    receipt = donationReceipt(
      row,
      paid ? 'paid' : 'failed',
      paid
        ? 'Your gift is confirmed. Thank you for standing with the foundation.'
        : 'The payment was not completed. You have not been charged for a confirmed gift.',
    );
  });
  if (missing) return { ok: false, error: 'This payment does not match an open donation' };
  if (pending) return { ok: false, pending: true, error: 'The payment is not complete yet.' };
  if (!receipt) return { ok: false, error: 'This payment could not be confirmed' };
  return { ok: receipt.status === 'paid', receipt };
}
