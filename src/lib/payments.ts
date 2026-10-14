export type PaymentProvider = 'cashfree' | 'razorpay';

export function paymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === 'razorpay' ? 'razorpay' : 'cashfree';
}

export function razorpayReady() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function cashfreeValue(name: string) {
  const value = (process.env[name] || '').trim();
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) return value.slice(1, -1).trim();
  return value;
}

export function cashfreeReady() {
  return Boolean(cashfreeValue('CASHFREE_APP_ID') && cashfreeValue('CASHFREE_SECRET_KEY'));
}

export function cashfreeMode(): 'sandbox' | 'production' {
  const value = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  return value === 'production' || value === 'prod' ? 'production' : 'sandbox';
}

export function paymentReady() {
  return paymentProvider() === 'razorpay' ? razorpayReady() : cashfreeReady();
}
