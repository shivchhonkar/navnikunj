'use client';

import { useMemo, useState } from 'react';
import type { Donation } from '@/lib/types';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'created', label: 'Created' },
  { id: 'paid', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

export function DonationsDesk({ donations }: { donations: Donation[] }) {
  const [filter, setFilter] = useState<FilterId>('all');
  const counts = useMemo(() => {
    const tally = { all: donations.length, created: 0, paid: 0, failed: 0 };
    for (const item of donations) tally[item.status] += 1;
    return tally;
  }, [donations]);
  const rows = filter === 'all' ? donations : donations.filter((item) => item.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Donations</h1>
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          Status
          <select
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-normal"
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterId)}
          >
            {FILTERS.map((item) => (
              <option key={item.id} value={item.id}>{item.label} ({counts[item.id]})</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Donor</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Payment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="px-3 py-3 whitespace-nowrap">{new Date(item.at).toLocaleString('en-IN')}</td>
                <td className="px-3 py-3">{item.name}<br /><span className="text-stone-500">{item.email} · {item.phone}</span></td>
                <td className="px-3 py-3">₹{item.amount.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 capitalize">{item.status}</td>
                <td className="px-3 py-3">{item.method || '—'}<br /><span className="text-stone-500">{item.paymentId || item.orderId}</span></td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-3 py-6 text-stone-500" colSpan={5}>
                  {filter === 'all' ? 'No donation attempts yet.' : `No ${filter} donations.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
