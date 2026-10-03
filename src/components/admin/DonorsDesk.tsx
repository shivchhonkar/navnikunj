'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { Donation } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

export function DonorsDesk({ donors }: { donors: Donation[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [rows, setRows] = useState(donors);
  const { show, clear } = useDeskNotice();

  const close = () => {
    if (pending) return;
    setOpen(false);
  };

  useEffect(() => {
    setRows(donors);
  }, [donors]);

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
      const response = await fetch('/api/admin/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          pan: data.get('pan'),
          amount: data.get('amount'),
          address: data.get('address'),
          country: data.get('country'),
        }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok || !saved.donor) {
        show('error', saved.error || 'The donor could not be saved.');
        return;
      }
      setRows((current) => [saved.donor as Donation, ...current.filter((item) => item.id !== saved.donor.id)]);
      form.reset();
      setOpen(false);
      show('success', 'Donor added to the list.');
      router.refresh();
    } catch {
      show('error', 'The donor could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setRemovingId(id);
    clear();
    try {
      const response = await fetch('/api/admin/donors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The donor could not be removed.');
        return;
      }
      setRows((current) => current.filter((item) => item.id !== id));
      show('success', 'Donor removed from the list.');
      router.refresh();
    } catch {
      show('error', 'The donor could not be removed. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Donors</h1>
          <p className="mt-2 text-sm text-stone-600">People who have given to the foundation, with the details needed for a receipt.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Add Donor</button>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Donor name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">PAN number</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Date and time</th>
              <th className="px-3 py-2">Payment ID</th>
              <th className="px-3 py-2">Payment mode</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-stone-100 align-top">
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3 whitespace-nowrap">{item.phone}</td>
                <td className="px-3 py-3 whitespace-nowrap">{item.pan || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">₹{item.amount.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 max-w-xs">{item.address || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{item.country || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{new Date(item.at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-3 py-3 whitespace-nowrap font-mono text-xs">{item.paymentId || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{item.method || (item.paymentId ? 'Razorpay' : 'Manual')}</td>
                <td className="px-3 py-3">
                  <button type="button" disabled={Boolean(removingId)} className="text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(item.id)}>
                    {removingId === item.id ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="px-3 py-6 text-stone-500" colSpan={10}>No donors yet. Add a donor, or they appear here after a confirmed gift.</td></tr>}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed bottom-0 right-0 top-16 z-20 left-0 overflow-y-auto bg-white transition-[left] duration-200 lg:left-[var(--admin-side)]" onClick={close}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-donor-title" className="min-h-full w-full bg-white px-6 py-6 lg:px-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="add-donor-title" className="text-2xl">Add donor</h2>
              <button type="button" onClick={close} className="rounded-md p-2 text-stone-500 hover:bg-stone-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form ref={formRef} onSubmit={submit} aria-busy={pending}>
              <fieldset disabled={pending} className="grid min-w-0 gap-3 border-0 p-0 md:grid-cols-2">
                <label className="text-sm font-medium">Donor name
                  <input name="name" required className={field} />
                </label>
                <label className="text-sm font-medium">Phone
                  <input name="phone" required className={field} />
                </label>
                <label className="text-sm font-medium">PAN number
                  <input name="pan" required maxLength={10} className={`${field} uppercase`} placeholder="ABCDE1234F" />
                </label>
                <label className="text-sm font-medium">Amount (₹)
                  <input name="amount" required inputMode="numeric" className={field} />
                </label>
                <label className="text-sm font-medium md:col-span-2">Address
                  <textarea name="address" required rows={2} className={field} />
                </label>
                <label className="text-sm font-medium">Country
                  <input name="country" required defaultValue="India" className={field} />
                </label>
                <div className="flex items-end justify-end gap-3 md:col-span-2">
                  <button type="button" onClick={close} className="text-sm text-stone-600">Cancel</button>
                  <button disabled={pending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : 'Save donor'}</button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
