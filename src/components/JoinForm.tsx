'use client';

import { FormEvent, useState } from 'react';
import { PEOPLE_ROLES } from '@/lib/people';
import type { VolunteerRole } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand';

const CTA: Record<VolunteerRole, string> = {
  volunteer: 'Offer to volunteer',
  support: 'Join the support team',
  fundraiser: 'Offer to raise funds',
};

export function JoinForm({ role, onRoleChange }: { role: VolunteerRole; onRoleChange: (role: VolunteerRole) => void }) {
  const label = PEOPLE_ROLES.find((item) => item.value === role)?.label || 'Volunteer';
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        city: form.get('city'),
        skills: form.get('skills'),
        availability: form.get('availability'),
        notes: form.get('notes'),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok || data.ok === false) {
      setError(data.error || 'Could not send your details.');
      return;
    }
    setSent(true);
    event.currentTarget.reset();
  };

  if (sent) {
    return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Thank you. The team has your details for the {label.toLowerCase()} list and will be in touch.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium">How do you want to help?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PEOPLE_ROLES.map((item) => (
            <label key={item.value} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold ${role === item.value ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink'}`}>
              <input type="radio" name="role" value={item.value} checked={role === item.value} onChange={() => onRoleChange(item.value)} className="sr-only" />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Name<input name="name" required className={field} autoComplete="name" /></label>
        <label className="block text-sm font-medium">Phone<input name="phone" required className={field} autoComplete="tel" /></label>
        <label className="block text-sm font-medium">Email<input name="email" type="email" className={field} autoComplete="email" /></label>
        <label className="block text-sm font-medium">City<input name="city" className={field} autoComplete="address-level2" /></label>
        <label className="block text-sm font-medium">Skills<input name="skills" className={field} placeholder="Teaching, coordination, outreach" /></label>
        <label className="block text-sm font-medium">Availability<input name="availability" className={field} placeholder="Weekends, evenings" /></label>
      </div>
      <label className="block text-sm font-medium">How would you like to help?<textarea name="notes" rows={4} className={field} /></label>
      <p className="text-xs leading-5 text-muted">Your phone and email stay with the team. They are not published on the website.</p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandDark disabled:opacity-60">{pending ? 'Sending…' : CTA[role]}</button>
    </form>
  );
}
