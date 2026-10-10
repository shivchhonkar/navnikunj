export type PaymentProvider = 'cashfree' | 'razorpay';

export function paymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === 'razorpay' ? 'razorpay' : 'cashfree';
}

export function razorpayReady() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function cashfreeReady() {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

export function cashfreeMode(): 'sandbox' | 'production' {
  const value = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  return value === 'production' || value === 'prod' ? 'production' : 'sandbox';
}

export function paymentReady() {
  return paymentProvider() === 'razorpay' ? razorpayReady() : cashfreeReady();
}
