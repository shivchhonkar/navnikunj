'use client';

import { FormEvent, ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { ICON_OPTIONS } from '@/lib/icons';
import type { Program, SiteData } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';

async function upload(file: File) {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

function useSectionSave() {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const { show, clear } = useDeskNotice();

  const save = async (event: FormEvent, body: Record<string, unknown>) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The changes could not be saved.');
        return;
      }
      show('success', 'Saved. The public site is updated.');
      router.refresh();
    } catch {
      show('error', 'The changes could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return { pending, show, clear, save };
}

function Editor({ children, onSubmit, pending }: { children: ReactNode; onSubmit: (event: FormEvent) => void; pending: boolean }) {
  return (
    <form onSubmit={onSubmit} className="max-w-3xl rounded-2xl bg-white p-5 shadow-sm" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-4 border-0 p-0">
        {children}
        <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
      </fieldset>
    </form>
  );
}

export function ContactEditor({ identity }: { identity: SiteData['identity'] }) {
  const [form, setForm] = useState(identity);
  const { pending, save } = useSectionSave();
  const set = (key: keyof SiteData['identity']) => (event: { target: { value: string } }) => setForm({ ...form, [key]: event.target.value });

  return (
    <Editor onSubmit={(event) => save(event, { identity: form })} pending={pending}>
      <div className="grid gap-3 md:grid-cols-2">
        {([
          ['name', 'Organisation name'],
          ['tagline', 'Tagline'],
          ['email', 'Email'],
          ['phone', 'Phone shown on the site'],
          ['phoneHref', 'Phone link, such as +919650593996'],
          ['mapQuery', 'Google Maps search'],
          ['facebook', 'Facebook URL'],
          ['instagram', 'Instagram URL'],
          ['youtube', 'YouTube URL'],
          ['linkedin', 'LinkedIn URL'],
        ] as const).map(([key, label]) => (
          <label key={key} className="block text-sm font-medium">{label}
            <input className={field} value={form[key]} onChange={set(key)} />
          </label>
        ))}
        <label className="block text-sm font-medium md:col-span-2">Address
          <textarea className={field} rows={4} value={form.address} onChange={set('address')} />
        </label>
      </div>
    </Editor>
  );
}

export function HeroEditor({ hero }: { hero: SiteData['hero'] }) {
  const [form, setForm] = useState(hero);
  const uploading = useRef(false);
  const { pending, show, clear, save } = useSectionSave();

  const onImage = async (file: File | undefined) => {
    if (!file || uploading.current || pending) return;
    uploading.current = true;
    clear();
    try {
      setForm({ ...form, image: await upload(file) });
      show('success', 'Image ready. Save to publish it on the site.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      uploading.current = false;
    }
  };

  return (
    <Editor onSubmit={(event) => save(event, { hero: form })} pending={pending}>
      <label className="block text-sm font-medium">Eyebrow<input className={field} value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} /></label>
      <label className="block text-sm font-medium">Headline<input className={field} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="block text-sm font-medium">Text<textarea className={field} rows={4} value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} /></label>
      <label className="block text-sm font-medium">Hero image
        <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => onImage(event.target.files?.[0])} />
      </label>
      {form.image ? <img src={form.image} alt="" className="h-36 w-full rounded-lg object-cover" /> : null}
    </Editor>
  );
}

export function AboutEditor({ about }: { about: SiteData['about'] }) {
  const [form, setAbout] = useState(about);
  const uploading = useRef(false);
  const { pending, show, clear, save } = useSectionSave();

  const onImage = async (file: File | undefined) => {
    if (!file || uploading.current || pending) return;
    uploading.current = true;
    clear();
    try {
      setAbout({ ...form, image: await upload(file) });
      show('success', 'Image ready. Save to publish it on the site.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      uploading.current = false;
    }
  };

  return (
    <Editor onSubmit={(event) => save(event, { about: form })} pending={pending}>
      <label className="block text-sm font-medium">Eyebrow<input className={field} value={form.eyebrow} onChange={(event) => setAbout({ ...form, eyebrow: event.target.value })} /></label>
      <label className="block text-sm font-medium">Title<input className={field} value={form.title} onChange={(event) => setAbout({ ...form, title: event.target.value })} /></label>
      <label className="block text-sm font-medium">Text<textarea className={field} rows={5} value={form.text} onChange={(event) => setAbout({ ...form, text: event.target.value })} /></label>
      <label className="block text-sm font-medium">Quote<input className={field} value={form.quote} onChange={(event) => setAbout({ ...form, quote: event.target.value })} /></label>
      <label className="block text-sm font-medium">About image
        <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => onImage(event.target.files?.[0])} />
      </label>
      {form.image ? <img src={form.image} alt="" className="h-36 w-full rounded-lg object-cover" /> : null}
    </Editor>
  );
}

export function DonationEditor({ cta }: { cta: SiteData['cta'] }) {
  const [form, setForm] = useState(cta);
  const { pending, save } = useSectionSave();

  return (
    <Editor onSubmit={(event) => save(event, { cta: form })} pending={pending}>
      <label className="block text-sm font-medium">Title<input className={field} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="block text-sm font-medium">Text<textarea className={field} rows={4} value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} /></label>
    </Editor>
  );
}

export function NumbersEditor({ stats }: { stats: SiteData['stats'] }) {
  const [form, setForm] = useState(stats);
  const { pending, save } = useSectionSave();

  return (
    <Editor onSubmit={(event) => save(event, { stats: form })} pending={pending}>
      <div className="flex justify-end">
        <button type="button" className="text-sm font-semibold text-brand" onClick={() => setForm([...form, { value: '', label: '' }])}>Add number</button>
      </div>
      <div className="space-y-2">
        {form.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className={field} value={item.value} placeholder="1,200+" onChange={(event) => setForm(form.map((row, i) => i === index ? { ...row, value: event.target.value } : row))} />
            <input className={field} value={item.label} placeholder="People supported" onChange={(event) => setForm(form.map((row, i) => i === index ? { ...row, label: event.target.value } : row))} />
            <button type="button" className="text-sm text-red-700" onClick={() => setForm(form.filter((_, i) => i !== index))}>Remove</button>
          </div>
        ))}
      </div>
    </Editor>
  );
}

export function ProgramsEditor({ programs }: { programs: Program[] }) {
  const [form, setForm] = useState(programs);
  const { pending, save } = useSectionSave();

  return (
    <Editor onSubmit={(event) => save(event, { programs: form })} pending={pending}>
      <div className="flex justify-end">
        <button type="button" className="text-sm font-semibold text-brand" onClick={() => setForm([...form, { id: '', slug: '', title: '', summary: '', body: '', icon: 'heart' }])}>Add program</button>
      </div>
      {form.map((program, index) => (
        <div key={program.id || index} className="rounded-xl border border-stone-200 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">Title<input className={field} value={program.title} onChange={(event) => setForm(updateProgram(form, index, { title: event.target.value }))} /></label>
            <label className="text-sm font-medium">Icon
              <select className={field} value={program.icon} onChange={(event) => setForm(updateProgram(form, index, { icon: event.target.value as Program['icon'] }))}>
                {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">Summary<textarea className={field} rows={2} value={program.summary} onChange={(event) => setForm(updateProgram(form, index, { summary: event.target.value }))} /></label>
            <label className="text-sm font-medium md:col-span-2">Full text<textarea className={field} rows={4} value={program.body} onChange={(event) => setForm(updateProgram(form, index, { body: event.target.value }))} /></label>
          </div>
          <button type="button" className="mt-2 text-sm text-red-700" onClick={() => setForm(form.filter((_, i) => i !== index))}>Remove program</button>
        </div>
      ))}
    </Editor>
  );
}

function updateProgram(programs: Program[], index: number, patch: Partial<Program>) {
  return programs.map((item, i) => i === index ? { ...item, ...patch } : item);
}
