'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { Cause, CauseProduct } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';

async function upload(file: File) {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

function blankCause(): Cause {
  return {
    id: '',
    slug: '',
    title: '',
    summary: '',
    story: '',
    image: '',
    images: [],
    location: '',
    organizer: 'Navnikunj Foundation',
    caption: '',
    raised: 0,
    goal: 0,
    donors: 0,
    urgent: false,
    taxBenefit: true,
    published: true,
    products: [],
  };
}

function blankProduct(): CauseProduct {
  return { id: '', name: '', image: '', needed: 0, price: 500, featured: false };
}

export function CausesDesk({ causes }: { causes: Cause[] }) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [rows, setRows] = useState(causes);
  const [selected, setSelected] = useState(0);
  const { show, clear } = useDeskNotice();
  const cause = rows[selected];

  const patch = (next: Partial<Cause>) => {
    setRows((current) => current.map((item, index) => index === selected ? { ...item, ...next } : item));
  };

  const patchProduct = (productIndex: number, next: Partial<CauseProduct>) => {
    if (!cause) return;
    patch({
      products: cause.products.map((item, index) => index === productIndex ? { ...item, ...next } : item),
    });
  };

  const pick = async (file: File | undefined, apply: (url: string) => void) => {
    if (!file) return;
    try {
      apply(await upload(file));
      show('success', 'Image ready. Save to publish it.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    if (rows.some((item) => !item.title.trim())) {
      show('error', 'Every cause needs a title.');
      return;
    }
    busy.current = true;
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ causes: rows }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The changes could not be saved.');
        return;
      }
      show('success', 'Causes saved. The public page is updated.');
      router.refresh();
    } catch {
      show('error', 'The changes could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[18rem_1fr]">
      <aside className="rounded-2xl bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <p className="text-sm font-semibold text-stone-700">{rows.length} causes</p>
          <button type="button" className="text-sm font-semibold text-brand" onClick={() => { setRows([...rows, blankCause()]); setSelected(rows.length); }}>Add</button>
        </div>
        <ul className="mt-2 space-y-1">
          {rows.map((item, index) => (
            <li key={item.id || index}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm ${index === selected ? 'bg-sand text-ink' : 'hover:bg-stone-50'}`}
              >
                {item.image ? <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="h-10 w-10 rounded-lg bg-sand" />}
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.title || 'Untitled cause'}</span>
                  <span className="text-xs text-stone-500">{item.published ? 'Visible' : 'Hidden'}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {cause ? (
        <fieldset disabled={pending} className="min-w-0 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">{cause.title || 'New cause'}</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <button type="button" className="rounded-full border border-stone-300 px-3 py-1.5" disabled={selected === 0} onClick={() => { const next = [...rows]; [next[selected - 1], next[selected]] = [next[selected], next[selected - 1]]; setRows(next); setSelected(selected - 1); }}>Move up</button>
              <button type="button" className="rounded-full border border-stone-300 px-3 py-1.5" disabled={selected === rows.length - 1} onClick={() => { const next = [...rows]; [next[selected + 1], next[selected]] = [next[selected], next[selected + 1]]; setRows(next); setSelected(selected + 1); }}>Move down</button>
              <button type="button" className="rounded-full border border-red-200 px-3 py-1.5 text-red-700" onClick={() => { const next = rows.filter((_, index) => index !== selected); setRows(next); setSelected(Math.max(0, selected - 1)); }}>Remove</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium md:col-span-2">Title
              <input className={field} value={cause.title} onChange={(event) => patch({ title: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Web address
              <input className={field} value={cause.slug} placeholder="Filled from the title if left blank" onChange={(event) => patch({ slug: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Organizer
              <input className={field} value={cause.organizer} onChange={(event) => patch({ organizer: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Location
              <input className={field} value={cause.location} onChange={(event) => patch({ location: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Photo caption
              <input className={field} value={cause.caption} onChange={(event) => patch({ caption: event.target.value })} />
            </label>
            <label className="text-sm font-medium md:col-span-2">Short summary
              <textarea className={field} rows={2} value={cause.summary} onChange={(event) => patch({ summary: event.target.value })} />
            </label>
            <label className="text-sm font-medium md:col-span-2">Story
              <textarea className={field} rows={4} value={cause.story} onChange={(event) => patch({ story: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Raised (₹)
              <input className={field} inputMode="decimal" value={cause.raised} onChange={(event) => patch({ raised: Number(event.target.value) || 0 })} />
            </label>
            <label className="text-sm font-medium">Goal (₹)
              <input className={field} inputMode="decimal" value={cause.goal} onChange={(event) => patch({ goal: Number(event.target.value) || 0 })} />
            </label>
            <label className="text-sm font-medium">Donors
              <input className={field} inputMode="numeric" value={cause.donors} onChange={(event) => patch({ donors: Number(event.target.value) || 0 })} />
            </label>
            <div className="flex flex-wrap items-end gap-4 pb-2 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={cause.published} onChange={(event) => patch({ published: event.target.checked })} /> Visible on the site</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={cause.urgent} onChange={(event) => patch({ urgent: event.target.checked })} /> Urgent</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={cause.taxBenefit} onChange={(event) => patch({ taxBenefit: event.target.checked })} /> Tax benefits</label>
            </div>
            <label className="text-sm font-medium md:col-span-2">Main photo
              <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => pick(event.target.files?.[0], (image) => patch({ image, images: [image, ...cause.images.filter((item) => item !== image)].slice(0, 6) }))} />
              {cause.image ? <img src={cause.image} alt="" className="mt-3 h-40 w-full rounded-xl object-cover" /> : null}
            </label>
          </div>

          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Products</h3>
              <button type="button" className="text-sm font-semibold text-brand" onClick={() => patch({ products: [...cause.products, blankProduct()] })}>Add product</button>
            </div>
            <div className="mt-3 space-y-3">
              {cause.products.map((product, index) => (
                <div key={product.id || index} className="grid gap-3 rounded-xl border border-stone-200 p-3 md:grid-cols-4">
                  <label className="text-sm font-medium md:col-span-2">Name
                    <input className={field} value={product.name} onChange={(event) => patchProduct(index, { name: event.target.value })} />
                  </label>
                  <label className="text-sm font-medium">Price (₹)
                    <input className={field} inputMode="decimal" value={product.price} onChange={(event) => patchProduct(index, { price: Number(event.target.value) || 0 })} />
                  </label>
                  <label className="text-sm font-medium">Qty needed
                    <input className={field} inputMode="numeric" value={product.needed} onChange={(event) => patchProduct(index, { needed: Number(event.target.value) || 0 })} />
                  </label>
                  <label className="text-sm font-medium md:col-span-2">Photo
                    <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => pick(event.target.files?.[0], (image) => patchProduct(index, { image }))} />
                  </label>
                  <label className="inline-flex items-center gap-2 self-end text-sm">
                    <input type="checkbox" checked={product.featured} onChange={(event) => patchProduct(index, { featured: event.target.checked })} />
                    Most impactful
                  </label>
                  <div className="flex items-end justify-between gap-2">
                    {product.image ? <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span />}
                    <button type="button" className="text-sm text-red-700" onClick={() => patch({ products: cause.products.filter((_, productIndex) => productIndex !== index) })}>Remove</button>
                  </div>
                </div>
              ))}
              {!cause.products.length ? <p className="text-sm text-stone-500">No products yet. Visitors can still give money.</p> : null}
            </div>
          </div>

          <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving…' : 'Save causes'}</button>
        </fieldset>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-sm text-stone-500 shadow-sm">
          No causes yet.
          <button type="button" className="ml-2 font-semibold text-brand" onClick={() => { setRows([blankCause()]); setSelected(0); }}>Add the first cause</button>
        </div>
      )}
    </form>
  );
}
