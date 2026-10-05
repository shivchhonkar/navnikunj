'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { Report, ReportKind } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

const LABELS: Record<ReportKind, string> = {
  overview: 'Overview',
  donations: 'Donations',
  donors: 'Donors',
  volunteers: 'Volunteers',
  events: 'Events',
};

export function ReportsDesk({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(reports);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.get('title'),
          kind: data.get('kind'),
          periodStart: data.get('periodStart'),
          periodEnd: data.get('periodEnd'),
        }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok || !saved.report) {
        show('error', saved.error || 'The report could not be created.');
        return;
      }
      setRows((current) => [saved.report as Report, ...current]);
      show('success', 'Report saved.');
      router.refresh();
    } catch {
      show('error', 'The report could not be created. Try again.');
    } finally {
      setPending(false);
    }
  };

  const publish = async (row: Report) => {
    const status = row.status === 'published' ? 'draft' : 'published';
    clear();
    const response = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, status }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The report could not be updated.');
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item));
    router.refresh();
  };

  const remove = async (id: string) => {
    clear();
    const response = await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The report could not be removed.');
      return;
    }
    setRows((current) => current.filter((item) => item.id !== id));
    show('success', 'Report removed.');
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm" aria-busy={pending}>
        <fieldset disabled={pending} className="grid gap-3 border-0 p-0 md:grid-cols-2">
          <label className="text-sm font-medium">Title
            <input name="title" className={field} placeholder="March donation report" />
          </label>
          <label className="text-sm font-medium">Report
            <select name="kind" className={field} defaultValue="overview">
              {Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">From
            <input name="periodStart" type="date" className={field} />
          </label>
          <label className="text-sm font-medium">To
            <input name="periodEnd" type="date" className={field} />
          </label>
          <button disabled={pending} className="w-fit rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving…' : 'Save report'}</button>
        </fieldset>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.title}</p>
                <p className="text-sm text-stone-500">{LABELS[row.kind] || row.kind} · {row.status} · {new Date(row.at).toLocaleString('en-IN')}</p>
                <p className="mt-2 text-sm leading-6 text-stone-700">{row.summary}</p>
                {(row.periodStart || row.periodEnd) ? <p className="mt-1 text-xs text-stone-500">{row.periodStart || 'Start'} to {row.periodEnd || 'today'}</p> : null}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => publish(row)} className="text-sm font-semibold text-brand">{row.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                <button type="button" onClick={() => remove(row.id)} className="text-sm text-red-700">Remove</button>
              </div>
            </div>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-stone-500">No saved reports yet.</li> : null}
      </ul>
    </div>
  );
}
