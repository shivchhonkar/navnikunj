'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { ImageAsset } from '@/lib/types';

function formatSize(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagesDesk({ images }: { images: ImageAsset[] }) {
  const router = useRouter();
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(images);

  const save = async (row: ImageAsset) => {
    clear();
    const response = await fetch('/api/admin/images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, alt: row.alt, caption: row.caption }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The image details could not be saved.');
      return;
    }
    show('success', 'Image details saved.');
    router.refresh();
  };

  const remove = async (id: string) => {
    clear();
    const response = await fetch('/api/admin/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The image could not be removed.');
      return;
    }
    setRows((current) => current.filter((item) => item.id !== id));
    show('success', 'Image record removed.');
    router.refresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="border-b border-stone-200 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">File</th>
            <th className="px-4 py-3 font-medium">Alt text</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Linked to</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-stone-100 align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-stone-800">{row.filename}</p>
                <p className="mt-1 max-w-[16rem] truncate text-xs text-stone-500">{row.url}</p>
              </td>
              <td className="px-4 py-3">
                <input aria-label={`Alt text for ${row.filename}`} value={row.alt} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, alt: event.target.value } : item))} className="w-full min-w-[12rem] rounded-lg border border-stone-300 px-2 py-1.5" />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatSize(row.size)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{row.type || '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{row.entityType ? `${row.entityType}${row.entityId ? ` · ${row.entityId}` : ''}` : '—'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <button type="button" onClick={() => save(row)} className="font-semibold text-brand">Save</button>
                  <button type="button" onClick={() => remove(row.id)} className="text-red-700">Remove</button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-stone-500">No image records yet. Uploads, gallery photos, and page pictures are stored here.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
