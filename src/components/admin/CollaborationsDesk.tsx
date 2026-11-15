'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { collaborationKindLabel } from '@/lib/people';
import type { Collaboration, CollaborationStatus } from '@/lib/types';

const STATUS: { value: CollaborationStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'closed', label: 'Closed' },
];

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CollaborationsDesk({ collaborations }: { collaborations: Collaboration[] }) {
  const router = useRouter();
  const busy = useRef(false);
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(collaborations);
  const [removingId, setRemovingId] = useState('');

  useEffect(() => {
    setRows(collaborations);
  }, [collaborations]);

  const setStatus = async (row: Collaboration, status: CollaborationStatus) => {
    if (busy.current) return;
    clear();
    const response = await fetch('/api/admin/collaborations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, status }),
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
      const response = await fetch('/api/admin/collaborations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', saved.error || 'The request could not be removed.');
        return;
      }
      setRows((current) => current.filter((item) => item.id !== id));
      show('success', 'Request removed.');
      router.refresh();
    } catch {
      show('error', 'The request could not be removed. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  return (
    <div>
      <h1 className="text-3xl">Collaboration</h1>
      <p className="mt-2 mb-6 max-w-2xl text-sm leading-6 text-stone-600">Notes from schools, companies, and other organisations that want to work with the foundation.</p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.name}{row.organization ? <span className="font-normal text-stone-500"> · {row.organization}</span> : null}</p>
                <p className="mt-1 text-sm text-stone-500">{[row.email, row.phone, collaborationKindLabel(row.kind), when(row.at)].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <select aria-label={`Status for ${row.name}`} value={row.status} onChange={(event) => setStatus(row, event.target.value as CollaborationStatus)} className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                  {STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <button type="button" disabled={Boolean(removingId)} className="text-sm text-red-700 disabled:opacity-50" onClick={() => remove(row.id)}>
                  {removingId === row.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{row.message}</p>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-stone-500">No collaboration requests yet.</li>}
      </ul>
    </div>
  );
}
