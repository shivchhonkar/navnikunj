'use client';

import { FormEvent, ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { ICON_LABELS, ICON_OPTIONS } from '@/lib/icons';
import { parseMapPoint } from '@/lib/map';
import { programPhoto } from '@/lib/programs';
import type { HeroSlide, Program, SiteData } from '@/lib/types';

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
  const [shared, setShared] = useState('');
  const [reading, setReading] = useState(false);
  const { pending, save, show } = useSectionSave();
  const set = (key: keyof SiteData['identity']) => (event: { target: { value: string } }) => setForm({ ...form, [key]: event.target.value });
  const place = (latitude: string, longitude: string) => {
    setForm({ ...form, latitude, longitude });
    show('success', 'Coordinates added. Save to update the map.');
  };
  const applyShared = async () => {
    const local = parseMapPoint(shared);
    if (local) {
      place(local.latitude, local.longitude);
      return;
    }
    setReading(true);
    try {
      const response = await fetch('/api/admin/map-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: shared }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'That shared location could not be read.');
        return;
      }
      place(data.latitude, data.longitude);
    } catch {
      show('error', 'That shared location could not be read.');
    } finally {
      setReading(false);
    }
  };
  const useDevice = () => {
    if (!navigator.geolocation) {
      show('error', 'This browser cannot share a location.');
      return;
    }
    setReading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setReading(false);
        place(position.coords.latitude.toFixed(6), position.coords.longitude.toFixed(6));
      },
      () => {
        setReading(false);
        show('error', 'Location was blocked. Allow location access, or paste a shared Maps link.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <Editor onSubmit={(event) => save(event, { identity: form })} pending={pending || reading}>
      <div className="grid gap-3 md:grid-cols-2">
        {([
          ['name', 'Organisation name'],
          ['tagline', 'Tagline'],
          ['email', 'Email'],
          ['phone', 'Header phone, such as +91 9720202640'],
          ['phoneHref', 'Header phone link, such as +919720202640'],
          ['phone2', 'Second contact phone'],
          ['phoneHref2', 'Second phone link, such as +919720202650'],
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
      <div className="rounded-xl border border-stone-200 p-4">
        <h2 className="text-lg text-ink">Contact map</h2>
        <p className="mt-1 text-sm text-stone-500">Set the pin with latitude and longitude. Leave both empty to keep searching by address.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-medium">Latitude
            <input className={field} inputMode="decimal" value={form.latitude} placeholder="27.580600" onChange={set('latitude')} />
          </label>
          <label className="block text-sm font-medium">Longitude
            <input className={field} inputMode="decimal" value={form.longitude} placeholder="77.700600" onChange={set('longitude')} />
          </label>
          <label className="block text-sm font-medium md:col-span-2">Shared location
            <span className="mt-1 flex gap-2">
              <input className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" value={shared} placeholder="Paste a Google Maps link, or 27.580600, 77.700600" onChange={(event) => setShared(event.target.value)} />
              <button type="button" className="shrink-0 rounded-full border border-stone-300 px-4 text-sm font-semibold" disabled={reading || !shared.trim()} onClick={applyShared}>Use link</button>
            </span>
          </label>
        </div>
        <button type="button" className="mt-3 text-sm font-semibold text-brand disabled:opacity-40" disabled={reading} onClick={useDevice}>Use this device&apos;s location</button>
        <label className="mt-4 block text-sm font-medium">Address search, used when coordinates are empty
          <input className={field} value={form.mapQuery} onChange={set('mapQuery')} />
        </label>
      </div>
    </Editor>
  );
}

function moveSlide(slides: HeroSlide[], from: number, to: number) {
  const next = [...slides];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function HeroEditor({ hero }: { hero: SiteData['hero'] }) {
  const [form, setForm] = useState(hero);
  const uploading = useRef(false);
  const { pending, show, clear, save } = useSectionSave();
  const slides = form.slides;

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    setForm((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => i === index ? { ...slide, ...patch } : slide),
    }));
  };

  const onImage = async (index: number, file: File | undefined) => {
    if (!file || uploading.current || pending) return;
    uploading.current = true;
    clear();
    try {
      updateSlide(index, { image: await upload(file) });
      show('success', 'Image ready. Save to publish it on the site.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      uploading.current = false;
    }
  };

  const onSave = (event: FormEvent) => {
    const images = slides.map((slide) => slide.image.trim()).filter(Boolean);
    if (!slides.length) {
      event.preventDefault();
      show('error', 'Add at least one slide.');
      return;
    }
    if (slides.some((slide) => !slide.image || !slide.title.trim() || !slide.text.trim())) {
      event.preventDefault();
      show('error', 'Each slide needs an image, a headline, and text.');
      return;
    }
    if (new Set(images).size !== images.length) {
      event.preventDefault();
      show('error', 'Each slide needs its own image.');
      return;
    }
    const first = slides[0];
    save(event, { hero: { eyebrow: form.eyebrow, title: first.title, text: first.text, image: first.image, slides } });
  };

  return (
    <Editor onSubmit={onSave} pending={pending}>
      <label className="block text-sm font-medium">Eyebrow
        <input className={field} value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} />
      </label>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-600">Priority 1 is shown first. More than one slide turns the home banner into a slider.</p>
        <button
          type="button"
          className="shrink-0 text-sm font-semibold text-brand"
          onClick={() => setForm({ ...form, slides: [...slides, { id: `hero_${Date.now().toString(36)}`, title: '', text: '', image: '' }] })}
        >
          Add slide
        </button>
      </div>
      {slides.map((slide, index) => (
        <div key={slide.id} className="rounded-xl border border-stone-200 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-stone-800">Priority {index + 1}</p>
            <div className="flex flex-wrap gap-3">
              <label className="text-sm text-stone-600">Set priority
                <input
                  type="number"
                  min={1}
                  max={slides.length}
                  defaultValue={index + 1}
                  key={`${slide.id}-${index}`}
                  aria-label={`Priority for slide ${index + 1}`}
                  className="ml-2 w-16 rounded-lg border border-stone-300 px-2 py-1 text-sm"
                  onBlur={(event) => {
                    const target = Math.min(slides.length, Math.max(1, Number(event.target.value) || index + 1)) - 1;
                    if (target !== index) setForm({ ...form, slides: moveSlide(slides, index, target) });
                  }}
                />
              </label>
              <button type="button" className="text-sm font-semibold text-brand disabled:opacity-40" disabled={index === 0} onClick={() => setForm({ ...form, slides: moveSlide(slides, index, index - 1) })}>Earlier</button>
              <button type="button" className="text-sm font-semibold text-brand disabled:opacity-40" disabled={index === slides.length - 1} onClick={() => setForm({ ...form, slides: moveSlide(slides, index, index + 1) })}>Later</button>
              <button type="button" className="text-sm text-red-700" onClick={() => setForm({ ...form, slides: slides.filter((_, i) => i !== index) })}>Remove</button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Headline
              <input className={field} value={slide.title} onChange={(event) => updateSlide(index, { title: event.target.value })} />
            </label>
            <label className="block text-sm font-medium">Text
              <textarea className={field} rows={3} value={slide.text} onChange={(event) => updateSlide(index, { text: event.target.value })} />
            </label>
            <label className="block text-sm font-medium">Image
              <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => onImage(index, event.target.files?.[0])} />
            </label>
            {slide.image ? <img src={slide.image} alt="" className="h-36 w-full rounded-lg object-cover" /> : null}
          </div>
        </div>
      ))}
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
  const [form, setForm] = useState(programs.map((program) => ({ ...program, image: programPhoto(program) })));
  const { pending, save, show } = useSectionSave();
  const pickImage = async (index: number, file: File | undefined) => {
    if (!file) return;
    try {
      const image = await upload(file);
      setForm((current) => updateProgram(current, index, { image }));
      show('success', 'Image ready. Save to publish it.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    }
  };

  return (
    <Editor onSubmit={(event) => save(event, { programs: form })} pending={pending}>
      <div className="flex justify-end">
        <button type="button" className="text-sm font-semibold text-brand" onClick={() => setForm([...form, { id: '', slug: '', title: '', summary: '', body: '', image: '', icon: 'heart' }])}>Add program</button>
      </div>
      {form.map((program, index) => (
        <div key={program.id || index} className="rounded-xl border border-stone-200 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">Title<input className={field} value={program.title} onChange={(event) => setForm(updateProgram(form, index, { title: event.target.value }))} /></label>
            <label className="text-sm font-medium">Icon
              <select className={field} value={program.icon} onChange={(event) => setForm(updateProgram(form, index, { icon: event.target.value as Program['icon'] }))}>
                {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{ICON_LABELS[icon]}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">Card image
              <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => pickImage(index, event.target.files?.[0])} />
              {program.image ? <img src={program.image} alt="" className="mt-3 h-32 w-full rounded-lg object-cover" /> : null}
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
