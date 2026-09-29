'use client';

import { FormEvent, useEffect, useState } from 'react';

const PRESETS = [500, 1000, 2500, 5000];
const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function DonateForm({ configured }: { configured: boolean }) {
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[data-razorpay]')) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.dataset.razorpay = 'true';
    document.body.appendChild(script);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!configured) {
      setError('Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local, then restart the app.');
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
    if (!response.ok || !data.orderId || !window.Razorpay) {
      setPending(false);
      setError(data.error || 'Payment could not be started.');
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
        setPending(false);
        if (verified.ok) setSuccess(`Thank you. Your gift of ₹${rupees.toLocaleString('en-IN')} is confirmed.`);
        else setError(verified.error || 'Payment reached Razorpay, but confirmation failed. The admin desk still has the attempt.');
      },
      modal: { ondismiss: () => setPending(false) },
    });
    checkout.open();
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
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
      {!configured && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Razorpay keys are not set yet. Add them in .env.local to take live payments.</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-emerald-800">{success}</p>}
      <button disabled={pending} className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brandDark disabled:opacity-60">{pending ? 'Opening Razorpay…' : 'Donate with Razorpay'}</button>
    </form>
  );
}
