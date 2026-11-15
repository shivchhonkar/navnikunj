'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { HomePageSettings, Testimonial } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

const blank = { id: '', name: '', role: '', quote: '', image: '', published: true, at: '' };

export function TestimonialsDesk({ testimonials, home }: { testimonials: Testimonial[]; home: HomePageSettings }) {
  const router = useRouter();
  const busy = useRef(false);
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(testimonials);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Testimonial>(blank);
  const [removingId, setRemovingId] = useState('');
  const [section, setSection] = useState(home.testimonials);
  const [sectionPending, setSectionPending] = useState(false);

  const close = () => {
    if (pending) return;
    setOpen(false);
  };

  useEffect(() => {
    setRows(testimonials);
  }, [testimonials]);

  useEffect(() => {
    setSection(home.testimonials);
  }, [home]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pending]);

  const upload = async (file: File) => {
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data.error || 'The photo could not be uploaded.');
    return data.url as string;
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    clear();
    try {
      const url = await upload(file);
      setDraft((current) => ({ ...current, image: url }));
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The photo could not be uploaded.');
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    clear();
    const editing = Boolean(draft.id);
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok || !saved.testimonial) {
        show('error', saved.error || 'The testimonial could not be saved.');
        return;
      }
      const testimonial = { ...saved.testimonial, at: saved.testimonial.at || draft.at || new Date().toISOString() } as Testimonial;
      setRows((current) => editing
        ? current.map((item) => item.id === testimonial.id ? { ...item, ...testimonial } : item)
        : [testimonial, ...current]);
      setOpen(false);
      show('success', editing ? 'Testimonial updated.' : 'Testimonial added.');
      router.refresh();
    } catch {
      show('error', 'The testimonial could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const setPublished = async (row: Testimonial, published: boolean) => {
    if (busy.current) return;
    clear();
    const response = await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...row, published }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The testimonial could not be updated.');
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, published } : item));
    router.refresh();
  };

  const saveSection = async (event: FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSectionPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home: { ...home, testimonials: section } }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', saved.error || 'The home section could not be saved.');
        return;
      }
      show('success', 'Home section updated.');
      router.refresh();
    } catch {
      show('error', 'The home section could not be saved. Try again.');
    } finally {
      busy.current = false;
      setSectionPending(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (busy.current || next < 0 || next >= rows.length) return;
    const copy = [...rows];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    setRows(copy);
    busy.current = true;
    clear();
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: copy.map((row) => row.id) }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) {
        setRows(rows);
        show('error', saved.error || 'The order could not be saved.');
        return;
      }
      router.refresh();
    } catch {
      setRows(rows);
      show('error', 'The order could not be saved. Try again.');
    } finally {
      busy.current = false;
    }
  };

  const remove = async (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setRemovingId(id);
    clear();
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', saved.error || 'The testimonial could not be removed.');
        return;
      }
      setRows((current) => current.filter((item) => item.id !== id));
      show('success', 'Testimonial removed.');
      router.refresh();
    } catch {
      show('error', 'The testimonial could not be removed. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Testimonials</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Quotes shown on the testimonials page and, when published, on the home page.</p>
        </div>
        <button type="button" onClick={() => { setDraft(blank); setOpen(true); }} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Add a testimonial</button>
      </div>

      <form onSubmit={saveSection} className="mb-6 max-w-3xl rounded-2xl bg-white p-4 shadow-sm" aria-busy={sectionPending}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">Home page section</h2>
          <label className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${section.visible ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
            <input type="checkbox" checked={section.visible} onChange={(event) => setSection({ ...section, visible: event.target.checked })} aria-label="Show testimonials on the home page" />
            {section.visible ? 'Shown on home' : 'Hidden on home'}
          </label>
        </div>
        <fieldset disabled={sectionPending} className="mt-4 grid gap-3 border-0 p-0 sm:grid-cols-2">
          <label className="text-sm font-medium">Heading
            <input value={section.heading} onChange={(event) => setSection({ ...section, heading: event.target.value })} className={field} />
          </label>
          <label className="text-sm font-medium">Subheading
            <input value={section.subheading} onChange={(event) => setSection({ ...section, subheading: event.target.value })} className={field} />
          </label>
          <div className="sm:col-span-2">
            <button disabled={sectionPending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{sectionPending ? 'Saving…' : 'Save home section'}</button>
          </div>
        </fieldset>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Person</th>
              <th className="px-3 py-2">Quote</th>
              <th className="px-3 py-2">On site</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-t border-stone-100 align-top">
                <td className="px-3 py-3">
                  <p className="font-medium">{row.name}</p>
                  <p className="mt-1 text-xs text-stone-500">{row.role || 'No role'}</p>
                </td>
                <td className="max-w-md px-3 py-3 text-stone-700">{row.quote}</td>
                <td className="px-3 py-3">
                  <input type="checkbox" aria-label={`Publish testimonial from ${row.name}`} checked={row.published} onChange={(event) => setPublished(row, event.target.checked)} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <button type="button" className="mr-3 text-sm font-semibold text-brand disabled:opacity-40" disabled={index === 0} onClick={() => move(index, -1)}>Earlier</button>
                  <button type="button" className="mr-3 text-sm font-semibold text-brand disabled:opacity-40" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>Later</button>
                  <button type="button" className="mr-3 text-sm text-brand" onClick={() => { setDraft(row); setOpen(true); }}>Edit</button>
                  <button type="button" disabled={Boolean(removingId)} className="text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(row.id)}>
                    {removingId === row.id ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className="px-3 py-6 text-stone-500" colSpan={4}>No testimonials yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed bottom-0 right-0 top-16 z-20 left-0 overflow-y-auto bg-white transition-[left] duration-200 lg:left-[var(--admin-side)]" onClick={close}>
          <div role="dialog" aria-modal="true" aria-labelledby="testimonial-form-title" className="min-h-full w-full bg-white px-6 py-6 lg:px-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="testimonial-form-title" className="text-2xl">{draft.id ? 'Edit testimonial' : 'Add a testimonial'}</h2>
              <button type="button" onClick={close} className="rounded-md p-2 text-stone-500 hover:bg-stone-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} aria-busy={pending}>
              <fieldset disabled={pending} className="grid min-w-0 max-w-3xl gap-3 border-0 p-0">
                <label className="text-sm font-medium">Name
                  <input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={field} />
                </label>
                <label className="text-sm font-medium">Who they are
                  <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} className={field} placeholder="Volunteer, donor, parent, partner" />
                </label>
                <label className="text-sm font-medium">Quote
                  <textarea required rows={5} value={draft.quote} onChange={(event) => setDraft({ ...draft, quote: event.target.value })} className={field} />
                </label>
                <div className="text-sm font-medium">Photo
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {draft.image ? <img src={draft.image} alt="" className="h-14 w-14 rounded-full object-cover" /> : null}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onPhoto(event.target.files?.[0])} className="text-sm" />
                    {draft.image ? <button type="button" className="text-sm text-stone-600" onClick={() => setDraft({ ...draft, image: '' })}>Remove photo</button> : null}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />
                  Show on the website
                </label>
                <div className="flex items-end justify-end gap-3">
                  <button type="button" onClick={close} className="text-sm text-stone-600">Cancel</button>
                  <button disabled={pending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : 'Save testimonial'}</button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
