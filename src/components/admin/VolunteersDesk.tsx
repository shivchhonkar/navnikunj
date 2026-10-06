'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { Volunteer, VolunteerStatus } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

const STATUS: { value: VolunteerStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function VolunteersDesk({ volunteers }: { volunteers: Volunteer[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(volunteers);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [removingId, setRemovingId] = useState('');

  const close = () => {
    if (pending) return;
    setOpen(false);
  };

  useEffect(() => {
    setRows(volunteers);
  }, [volunteers]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pending]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    busy.current = true;
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
      setRows((current) => [saved.volunteer as Volunteer, ...current.filter((item) => item.id !== saved.volunteer.id)]);
      form.reset();
      setOpen(false);
      show('success', 'Volunteer added.');
      router.refresh();
    } catch {
      show('error', 'The volunteer could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const setStatus = async (row: Volunteer, status: VolunteerStatus) => {
    if (busy.current) return;
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
    if (busy.current) return;
    busy.current = true;
    setRemovingId(id);
    clear();
    try {
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
    } catch {
      show('error', 'The volunteer could not be removed. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Volunteers</h1>
          <p className="mt-2 text-sm text-stone-600">People who have offered time, and whether they are active.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Add volunteers</button>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Skills</th>
              <th className="px-3 py-2">Availability</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-stone-100 align-top">
                <td className="px-3 py-3 font-medium">
                  {row.name}
                  {row.notes ? <p className="mt-1 max-w-xs whitespace-pre-wrap text-xs font-normal leading-5 text-stone-500">{row.notes}</p> : null}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{row.phone}</td>
                <td className="px-3 py-3">{row.email || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{row.city || '—'}</td>
                <td className="px-3 py-3">{row.skills || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{row.availability || '—'}</td>
                <td className="px-3 py-3">
                  <select aria-label={`Status for ${row.name}`} value={row.status} onChange={(event) => setStatus(row, event.target.value as VolunteerStatus)} className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                    {STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <button type="button" disabled={Boolean(removingId)} className="text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(row.id)}>
                    {removingId === row.id ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="px-3 py-6 text-stone-500" colSpan={8}>No volunteers yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed bottom-0 right-0 top-16 z-20 left-0 overflow-y-auto bg-white transition-[left] duration-200 lg:left-[var(--admin-side)]" onClick={close}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-volunteer-title" className="min-h-full w-full bg-white px-6 py-6 lg:px-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="add-volunteer-title" className="text-2xl">Add volunteers</h2>
              <button type="button" onClick={close} className="rounded-md p-2 text-stone-500 hover:bg-stone-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form ref={formRef} onSubmit={submit} aria-busy={pending}>
              <fieldset disabled={pending} className="grid min-w-0 gap-3 border-0 p-0 md:grid-cols-2">
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
                    {STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium md:col-span-2">Notes
                  <textarea name="notes" rows={3} className={field} />
                </label>
                <div className="flex items-end justify-end gap-3 md:col-span-2">
                  <button type="button" onClick={close} className="text-sm text-stone-600">Cancel</button>
                  <button disabled={pending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : 'Save volunteer'}</button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
