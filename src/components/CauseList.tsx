'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { inr } from '@/lib/causes';
import type { Cause } from '@/lib/types';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function CauseList({ causes }: { causes: Cause[] }) {
  const [tab, setTab] = useState<TabId>('all');
  const urgentCount = causes.filter((cause) => cause.urgent).length;
  const visible = tab === 'urgent' ? causes.filter((cause) => cause.urgent) : causes;
  const counts: Record<TabId, number> = { all: causes.length, urgent: urgentCount };

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full border border-line bg-white p-1" role="tablist" aria-label="Filter causes">
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${selected ? 'bg-brand text-white' : 'text-ink hover:text-brand'}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                <span className={`ml-1.5 ${selected ? 'text-white/80' : 'text-muted'}`}>{counts[item.id]}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted">{visible.length} {visible.length === 1 ? 'cause' : 'causes'}</p>
      </div>

      {visible.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((cause) => {
            const progress = cause.goal > 0 ? Math.min(100, Math.round((cause.raised / cause.goal) * 100)) : 0;
            return (
              <article key={cause.id} className="card flex h-full flex-col overflow-hidden border border-line transition-shadow hover:shadow-card">
                <Link href={`/donatekart/${cause.slug}`} className="relative block h-52">
                  {cause.image ? <img src={cause.image} alt="" className="h-full w-full object-cover" /> : <span className="block h-full bg-sand" />}
                  {cause.taxBenefit ? (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">Tax benefits</span>
                  ) : null}
                  {cause.urgent ? (
                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand">Urgent</span>
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg leading-snug text-ink">
                    <Link href={`/donatekart/${cause.slug}`} className="hover:text-brand">{cause.title}</Link>
                  </h2>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>By {cause.organizer}</span>
                    {cause.location ? <span className="inline-flex items-center gap-1"><MapPin size={12} /> {cause.location}</span> : null}
                  </p>
                  <p className="lead mt-3 line-clamp-2 flex-1 text-sm">{cause.summary}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{inr(cause.raised)} raised</span>
                    <span className="font-semibold text-brand">{cause.donors.toLocaleString('en-IN')} donors</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">
          {tab === 'urgent' ? 'No urgent causes are open right now.' : 'No causes are open for gifts right now.'}
        </p>
      )}
    </>
  );
}
