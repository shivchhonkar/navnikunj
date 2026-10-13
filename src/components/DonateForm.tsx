'use client';

import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Check, Globe, HandHeart, IdCard, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import { DonateReceipt } from '@/components/DonateReceipt';
import type { DonationReceipt } from '@/lib/types';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore', 'Nepal', 'Other'];

const PRESETS = [5000, 10000, 25000, 51000];
const PAN_ABOVE = 49000;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
function controlClass(invalid?: boolean) {
  return `w-full rounded-xl border bg-white py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-brand ${invalid ? 'border-red-600' : 'border-line'}`;
}

function money(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function amountValue(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, fraction = ''] = cleaned.split('.');
  if (!cleaned.includes('.')) return whole.slice(0, 7);
  return `${whole.slice(0, 7)}.${fraction.slice(0, 2)}`;
}

function rupeesOf(value: string) {
  if (!value || value === '.') return Number.NaN;
  return Number(value);
}

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

function FieldShell({
  id,
  label,
  required,
  optional,
  error,
  hint,
  icon,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-ink" htmlFor={id}>
      <span>
        {label}
        {required ? <span className="text-brand"> *</span> : null}
        {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
      </span>
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute left-3 top-3 text-muted">{icon}</span>
        {children}
      </span>
      {error ? <span className="mt-1 block text-xs font-normal text-red-700">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

type FieldErrors = Partial<Record<'amount' | 'name' | 'email' | 'phone' | 'pan', string>>;

export function DonateForm({ provider, configured }: { provider: 'cashfree' | 'razorpay'; configured: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [amountInput, setAmountInput] = useState('5000');
  const [pan, setPan] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const rupees = rupeesOf(amountInput);
  const panRequired = Number.isFinite(rupees) && rupees > PAN_ABOVE;

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
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const panValue = pan.trim().toUpperCase();
    const nextErrors: FieldErrors = {};
    if (!amountInput.trim() || !Number.isFinite(rupees) || rupees < 1) nextErrors.amount = 'Enter an amount of at least ₹1.';
    else if (rupees > 1000000) nextErrors.amount = 'Enter an amount up to ₹10,00,000.';
    if (!name.trim()) nextErrors.name = 'Enter your name.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email, or leave this blank.';
    if (phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Enter a 10-digit phone number.';
    if (panRequired && !panValue) nextErrors.pan = 'PAN is required for a donation above ₹49,000.';
    else if (panValue && !PAN_PATTERN.test(panValue)) nextErrors.pan = panRequired ? 'Enter a valid PAN, such as ABCDE1234F.' : 'Enter a valid PAN, such as ABCDE1234F, or leave this blank.';
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      const fieldId: Record<string, string> = {
        amount: 'donation-amount',
        name: 'donation-name',
        email: 'donation-email',
        phone: 'donation-phone',
        pan: 'donation-pan',
      };
      const first = Object.keys(nextErrors).find((key) => nextErrors[key as keyof FieldErrors]);
      if (first) document.getElementById(fieldId[first])?.focus();
      return;
    }
    setFieldErrors({});
    setPending(true);
    const response = await fetch('/api/donate/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: rupees,
        name,
        email,
        phone,
        pan: panValue,
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
          setAmountInput('5000');
          setPan('');
          setFieldErrors({});
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

  const payLabel = provider === 'cashfree' ? 'Donate with Cashfree' : 'Donate with Razorpay';

  return (
    <form ref={formRef} onSubmit={submit} className="card space-y-5 border border-line p-5 sm:p-6">
      <div className="flex items-start gap-3 rounded-2xl bg-sand px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand">
          <HandHeart size={18} />
        </span>
        <span>
          <span className="block font-semibold text-ink">Choose your donation amount</span>
          <span className="mt-0.5 block text-xs text-muted">Select an amount or enter your own</span>
        </span>
      </div>
      <fieldset>
        <legend className="sr-only">Suggested amounts</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((value) => {
            const selected = Number.isFinite(rupees) && rupees === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setAmountInput(String(value));
                  setFieldErrors((current) => ({ ...current, amount: undefined }));
                }}
                className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-sm font-semibold ${selected ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand'}`}
              >
                {money(value)}
                {selected ? <Check size={14} strokeWidth={3} /> : null}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block text-sm font-medium text-ink" htmlFor="donation-amount">
        Custom amount (₹) <span className="text-brand">*</span>
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
          <input
            id="donation-amount"
            name="amount"
            value={amountInput}
            onChange={(event) => {
              setAmountInput(amountValue(event.target.value));
              setFieldErrors((current) => ({ ...current, amount: undefined }));
            }}
            inputMode="decimal"
            required
            aria-invalid={Boolean(fieldErrors.amount)}
            aria-describedby="donation-amount-hint"
            className={`${controlClass(Boolean(fieldErrors.amount))} pl-8 pr-3`}
            placeholder="5000"
          />
        </span>
        <span id="donation-amount-hint" className={`mt-1 block text-xs font-normal ${fieldErrors.amount ? 'text-red-700' : 'text-muted'}`}>
          {fieldErrors.amount || 'A suggested amount fills this field. You can change it before you pay.'}
        </span>
      </label>
      <div className="flex items-center gap-2 border-t border-line pt-4 text-ink">
        <User size={18} className="text-brand" />
        <h3 className="text-base font-semibold">Your details</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell id="donation-name" label="Name" required error={fieldErrors.name} icon={<User size={16} />}>
          <input id="donation-name" name="name" required autoComplete="name" placeholder="Enter your full name" aria-invalid={Boolean(fieldErrors.name)} className={`${controlClass(Boolean(fieldErrors.name))} pl-10 pr-3`} />
        </FieldShell>
        <FieldShell id="donation-email" label="Email" optional error={fieldErrors.email} icon={<Mail size={16} />}>
          <input id="donation-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} className={`${controlClass(Boolean(fieldErrors.email))} pl-10 pr-3`} />
        </FieldShell>
        <FieldShell id="donation-phone" label="Phone" required error={fieldErrors.phone} icon={<Phone size={16} />}>
          <input id="donation-phone" name="phone" type="tel" required autoComplete="tel" placeholder="Enter your mobile number" aria-invalid={Boolean(fieldErrors.phone)} className={`${controlClass(Boolean(fieldErrors.phone))} pl-10 pr-3`} />
        </FieldShell>
        <FieldShell
          id="donation-pan"
          label="PAN number"
          required={panRequired}
          optional={!panRequired}
          error={fieldErrors.pan}
          hint={panRequired ? 'Required for a donation above ₹49,000.' : 'Needed only when the amount is above ₹49,000.'}
          icon={<IdCard size={16} />}
        >
          <input
            id="donation-pan"
            name="pan"
            value={pan}
            onChange={(event) => {
              setPan(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
              setFieldErrors((current) => ({ ...current, pan: undefined }));
            }}
            maxLength={10}
            required={panRequired}
            aria-invalid={Boolean(fieldErrors.pan)}
            className={`${controlClass(Boolean(fieldErrors.pan))} pl-10 pr-3 uppercase`}
            autoComplete="off"
            placeholder="ABCDE1234F"
          />
        </FieldShell>
      </div>
      <FieldShell id="donation-address" label="Address" optional icon={<MapPin size={16} />}>
        <textarea id="donation-address" name="address" rows={2} placeholder="Enter your address" className={`${controlClass()} pl-10 pr-3`} autoComplete="street-address" />
      </FieldShell>
      <div className="sm:max-w-[calc(50%-0.5rem)]">
        <FieldShell id="donation-country" label="Country" optional icon={<Globe size={16} />}>
          <select id="donation-country" name="country" defaultValue="India" className={`${controlClass()} appearance-none pl-10 pr-8`}>
            {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>
        </FieldShell>
      </div>
      {!configured && <p className="rounded-lg bg-sand px-3 py-2 text-sm text-brandDark">{provider === 'cashfree' ? 'Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env, then restart the app.' : 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env, then restart the app.'}</p>}
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button disabled={pending} className="btn btn-brand w-full justify-center py-3.5 disabled:opacity-60">
        <ShieldCheck size={16} />
        {pending ? 'Opening checkout…' : payLabel}
        <ArrowRight size={16} />
      </button>
      {receipt && <DonateReceipt receipt={receipt} onClose={() => setReceipt(null)} />}
    </form>
  );
}
