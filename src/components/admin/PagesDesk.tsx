'use client';

import { FormEvent, useId, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { bannerLabel, type PageBanner } from '@/lib/banners';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';

async function upload(file: File) {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

function BannerCard({ banner, onChange }: { banner: PageBanner; onChange: (banner: PageBanner) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const panelId = useId();
  const { show } = useDeskNotice();
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setPending(true);
    try {
      onChange({ ...banner, image: await upload(file) });
      show('success', 'Image ready. Save to publish it.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <button type="button" className="flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
        <ChevronRight className={`shrink-0 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`} size={18} aria-hidden />
        <img src={banner.image} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
        <span className="min-w-0">
          <span className="block text-base font-semibold text-ink">{bannerLabel(banner.slug)}</span>
          {open ? null : <span className="mt-0.5 block truncate text-sm text-stone-500">{banner.title}{banner.text ? ` — ${banner.text}` : ''}</span>}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="space-y-3 border-t border-stone-200 px-4 py-4">
          <label className="block text-sm font-medium">Banner image
            <input type="file" accept="image/*" disabled={pending} className="mt-1 block text-sm" onChange={(event) => pick(event.target.files?.[0])} />
            <img src={banner.image} alt="" className="mt-3 h-36 w-full rounded-lg object-cover" />
          </label>
          <label className="block text-sm font-medium">Heading<input className={field} value={banner.title} onChange={(event) => onChange({ ...banner, title: event.target.value })} /></label>
          <label className="block text-sm font-medium">Text<textarea className={field} rows={3} value={banner.text} onChange={(event) => onChange({ ...banner, text: event.target.value })} /></label>
        </div>
      ) : null}
    </section>
  );
}

export function PagesDesk({ banners }: { banners: PageBanner[] }) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(banners);
  const { show, clear } = useDeskNotice();

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: form }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The banners could not be saved.');
        return;
      }
      show('success', 'Saved. The page banners are updated.');
      router.refresh();
    } catch {
      show('error', 'The banners could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl space-y-3" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-3 border-0 p-0">
        {form.map((banner, index) => (
          <BannerCard key={banner.slug} banner={banner} onChange={(next) => setForm(form.map((item, itemIndex) => itemIndex === index ? next : item))} />
        ))}
        <div className="sticky bottom-4 flex justify-end pt-2">
          <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{pending ? 'Saving…' : 'Save banners'}</button>
        </div>
      </fieldset>
    </form>
  );
}
