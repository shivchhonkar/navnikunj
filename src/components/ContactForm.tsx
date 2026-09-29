'use client';

import { FormEvent, useState } from 'react';

const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        message: form.get('message'),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok || data.ok === false) {
      setError(data.error || 'Could not send the message.');
      return;
    }
    setSent(true);
    event.currentTarget.reset();
  };

  if (sent) {
    return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Thank you. Your message is with the team.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium">Name<input name="name" required className={field} autoComplete="name" /></label>
      <label className="block text-sm font-medium">Email<input name="email" type="email" required className={field} autoComplete="email" /></label>
      <label className="block text-sm font-medium">Phone<input name="phone" required className={field} autoComplete="tel" /></label>
      <label className="block text-sm font-medium">Message<textarea name="message" required rows={5} className={field} /></label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandDark disabled:opacity-60">{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
