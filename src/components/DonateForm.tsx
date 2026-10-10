'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { DonateReceipt } from '@/components/DonateReceipt';
import type { DonationReceipt } from '@/lib/types';

const PRESETS = [5000, 10000, 25000, 51000];
const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string; metadata?: { order_id?: string; payment_id?: string } | string } }) => void) => void;
};

type CashfreeResult = {
  error?: { message?: string };
  paymentDetails?: { orderId?: string };
  redirect?: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: '_modal' }) => Promise<CashfreeResult>;
    };
  }
}

function failedMeta(metadata: { order_id?: string; payment_id?: string } | string | undefined) {
  if (!metadata) return { orderId: '', paymentId: '' };
  if (typeof metadata === 'string') {
    try {
      return failedMeta(JSON.parse(metadata));
    } catch {
      return { orderId: '', paymentId: '' };
    }
  }
  return { orderId: metadata.order_id || '', paymentId: metadata.payment_id || '' };
}

function loadScript(src: string, marker: string) {
  const existing = document.querySelector(`script[data-${marker}]`) as HTMLScriptElement | null;
  if (existing?.dataset.ready === 'true') return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = existing || document.createElement('script');
    script.src = src;
    script.dataset[marker] = 'true';
    script.onload = () => {
      script.dataset.ready = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Payment checkout could not be loaded.'));
    if (!existing) document.body.appendChild(script);
    else if ((marker === 'razorpay' && window.Razorpay) || (marker === 'cashfree' && window.Cashfree)) resolve();
  });
}

export function DonateForm({ provider, configured }: { provider: 'cashfree' | 'razorpay'; configured: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState(5000);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);

  useEffect(() => {
    const loading = provider === 'cashfree'
      ? loadScript('https://sdk.cashfree.com/js/v3/cashfree.js', 'cashfree')
      : loadScript('https://checkout.razorpay.com/v1/checkout.js', 'razorpay');
    loading.catch(() => undefined);
  }, [provider]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setReceipt(null);
    if (!configured) {
      setError(provider === 'cashfree'
        ? 'Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env, then restart the app.'
        : 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env, then restart the app.');
      return;
    }
    const form = new FormData(event.currentTarget);
    const rupees = custom ? Number(custom) : amount;
    if (!Number.isFinite(rupees) || rupees < 1) {
      setError('Enter a donation of at least ₹1.');
      return;
    }
    setPending(true);
    const response = await fetch('/api/donate/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: rupees,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        pan: form.get('pan'),
        address: form.get('address'),
        country: form.get('country'),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.orderId) {
      setPending(false);
      setError(data.error || 'Payment could not be started.');
      return;
    }
    try {
      await loadScript(
        data.provider === 'cashfree' ? 'https://sdk.cashfree.com/js/v3/cashfree.js' : 'https://checkout.razorpay.com/v1/checkout.js',
        data.provider === 'cashfree' ? 'cashfree' : 'razorpay',
      );
    } catch (reason) {
      setPending(false);
      setError(reason instanceof Error ? reason.message : 'Payment checkout could not be loaded.');
      return;
    }
    const finish = (verified: { ok?: boolean; error?: string; receipt?: DonationReceipt }) => {
      setPending(false);
      if (verified.receipt) {
        setReceipt(verified.receipt);
        if (verified.ok) {
          formRef.current?.reset();
          setAmount(5000);
          setCustom('');
        }
        return;
      }
      setError(verified.error || 'The payment could not be confirmed. The admin desk still has the attempt.');
    };
    if (data.provider === 'cashfree') {
      if (!data.paymentSessionId || !window.Cashfree) {
        setPending(false);
        setError('Payment could not be started.');
        return;
      }
      const cashfree = window.Cashfree({ mode: data.mode === 'production' ? 'production' : 'sandbox' });
      const result = await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_modal' });
      if (result.error && !result.paymentDetails) {
        setPending(false);
        setError(result.error.message || 'The payment was not completed.');
        return;
      }
      const verified = await fetch('/api/donate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderId }),
      }).then((item) => item.json()).catch(() => ({}));
      finish(verified);
      return;
    }
    if (!window.Razorpay) {
      setPending(false);
      setError('Payment could not be started.');
      return;
    }
    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: 'INR',
      name: 'Navnikunj Foundation',
      description: 'Donation',
      order_id: data.orderId,
      prefill: { name: form.get('name'), email: form.get('email'), contact: form.get('phone') },
      handler: async (payload: CheckoutResponse) => {
        const verified = await fetch('/api/donate/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then((item) => item.json()).catch(() => ({}));
        finish(verified);
      },
      modal: { ondismiss: () => setPending(false) },
    });
    checkout.on('payment.failed', async (response) => {
      const meta = failedMeta(response.error?.metadata);
      const result = await fetch('/api/donate/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: meta.orderId || data.orderId,
          paymentId: meta.paymentId,
          reason: response.error?.description || '',
        }),
      }).then((item) => item.json()).catch(() => ({}));
      setPending(false);
      if (result.receipt) setReceipt(result.receipt);
      else setError(result.error || response.error?.description || 'The payment was not completed.');
    });
    checkout.open();
  };

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => { setAmount(value); setCustom(''); }}
            className={`rounded-full border px-3 py-2 text-sm font-semibold ${!custom && amount === value ? 'border-brand bg-brand text-white' : 'border-stone-300'}`}
          >
            ₹{value.toLocaleString('en-IN')}
          </button>
        ))}
      </div>
      <label className="block text-sm font-medium">Other amount (₹)
        <input value={custom} onChange={(event) => setCustom(event.target.value)} inputMode="numeric" className={field} placeholder="Enter an amount" />
      </label>
      <label className="block text-sm font-medium">Name<input name="name" required className={field} autoComplete="name" /></label>
      <label className="block text-sm font-medium">Email<input name="email" type="email" required className={field} autoComplete="email" /></label>
      <label className="block text-sm font-medium">Phone<input name="phone" required className={field} autoComplete="tel" /></label>
      <label className="block text-sm font-medium">PAN number<input name="pan" required maxLength={10} className={`${field} uppercase`} autoComplete="off" placeholder="ABCDE1234F" /></label>
      <label className="block text-sm font-medium">Address<textarea name="address" required rows={2} className={field} autoComplete="street-address" /></label>
      <label className="block text-sm font-medium">Country<input name="country" required defaultValue="India" className={field} autoComplete="country-name" /></label>
      {!configured && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{provider === 'cashfree' ? 'Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env, then restart the app.' : 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env, then restart the app.'}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brandDark disabled:opacity-60">{pending ? 'Opening checkout…' : provider === 'cashfree' ? 'Donate with Cashfree' : 'Donate with Razorpay'}</button>
      {receipt && <DonateReceipt receipt={receipt} onClose={() => setReceipt(null)} />}
    </form>
  );
}
