'use client';

import { FormEvent, useState } from 'react';
import { COLLABORATION_KINDS } from '@/lib/people';

const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';

export function CollaborateForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/collaborate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        organization: form.get('organization'),
        email: form.get('email'),
        phone: form.get('phone'),
        kind: form.get('kind'),
        message: form.get('message'),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok || data.ok === false) {
      setError(data.error || 'Could not send your note.');
      return;
    }
    setSent(true);
    event.currentTarget.reset();
  };

  if (sent) {
    return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Thank you. The team has your note and will reply by email.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Your name<input name="name" required className={field} autoComplete="name" /></label>
        <label className="block text-sm font-medium">Organisation<input name="organization" className={field} /></label>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required className={field} autoComplete="email" /></label>
        <label className="block text-sm font-medium">Phone<input name="phone" className={field} autoComplete="tel" /></label>
      </div>
      <label className="block text-sm font-medium">How would you like to collaborate?
        <select name="kind" className={field} defaultValue="organisation">
          {COLLABORATION_KINDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">What do you have in mind?<textarea name="message" required rows={5} className={field} /></label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandDark disabled:opacity-60">{pending ? 'Sending…' : 'Send a note'}</button>
    </form>
  );
}
