'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { Volunteer, VolunteerStatus } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

export function VolunteersDesk({ volunteers }: { volunteers: Volunteer[] }) {
  const router = useRouter();
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(volunteers);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          city: data.get('city'),
          skills: data.get('skills'),
          availability: data.get('availability'),
          status: data.get('status'),
          notes: data.get('notes'),
        }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok || !saved.volunteer) {
        show('error', saved.error || 'The volunteer could not be saved.');
        return;
      }
      setRows((current) => [saved.volunteer as Volunteer, ...current]);
      form.reset();
      show('success', 'Volunteer added.');
      router.refresh();
    } catch {
      show('error', 'The volunteer could not be saved. Try again.');
    } finally {
      setPending(false);
    }
  };

  const setStatus = async (row: Volunteer, status: VolunteerStatus) => {
    clear();
    const response = await fetch('/api/admin/volunteers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...row, status }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The status could not be changed.');
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item));
    router.refresh();
  };

  const remove = async (id: string) => {
    clear();
    const response = await fetch('/api/admin/volunteers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The volunteer could not be removed.');
      return;
    }
    setRows((current) => current.filter((item) => item.id !== id));
    show('success', 'Volunteer removed.');
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm" aria-busy={pending}>
        <fieldset disabled={pending} className="grid gap-3 border-0 p-0 md:grid-cols-2">
          <label className="text-sm font-medium">Name
            <input name="name" required className={field} />
          </label>
          <label className="text-sm font-medium">Phone
            <input name="phone" required className={field} />
          </label>
          <label className="text-sm font-medium">Email
            <input name="email" type="email" className={field} />
          </label>
          <label className="text-sm font-medium">City
            <input name="city" className={field} />
          </label>
          <label className="text-sm font-medium">Skills
            <input name="skills" className={field} placeholder="Teaching, health camp, driving" />
          </label>
          <label className="text-sm font-medium">Availability
            <input name="availability" className={field} placeholder="Weekends" />
          </label>
          <label className="text-sm font-medium">Status
            <select name="status" className={field} defaultValue="applied">
              <option value="applied">Applied</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="text-sm font-medium md:col-span-2">Notes
            <textarea name="notes" rows={3} className={field} />
          </label>
          <button disabled={pending} className="w-fit rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving…' : 'Add volunteer'}</button>
        </fieldset>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm text-stone-500">{[row.phone, row.email, row.city].filter(Boolean).join(' · ')}</p>
                {row.skills ? <p className="mt-2 text-sm text-stone-700">Skills: {row.skills}</p> : null}
                {row.availability ? <p className="text-sm text-stone-700">Available: {row.availability}</p> : null}
                {row.notes ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">{row.notes}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                <select aria-label={`Status for ${row.name}`} value={row.status} onChange={(event) => setStatus(row, event.target.value as VolunteerStatus)} className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                  <option value="applied">Applied</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button type="button" onClick={() => remove(row.id)} className="text-sm text-red-700">Remove</button>
              </div>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-stone-500">No volunteers yet.</li> : null}
      </ul>
    </div>
  );
}
