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
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Transaction status">
        {FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-brand text-white' : 'bg-white text-stone-700 shadow-sm hover:bg-sand'}`}
            >
              {item.label}
              <span className={`ml-2 ${active ? 'text-white/80' : 'text-stone-400'}`}>{counts[item.id]}</span>
            </button>
          );
        })}
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
