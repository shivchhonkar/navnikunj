'use client';

import { FormEvent, ReactNode, useId, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { ICON_LABELS, ICON_OPTIONS } from '@/lib/icons';
import { programPhoto } from '@/lib/programs';
import type { HomePageSettings, Program, SiteData } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';

async function upload(file: File) {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

function Section({ title, summary, hint, visible, onVisible, children }: { title: string; summary: string; hint: string; visible: boolean; onVisible: (visible: boolean) => void; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
          <ChevronRight className={`shrink-0 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`} size={18} aria-hidden />
          <span className="min-w-0">
            <span className={`block text-base font-semibold ${visible ? 'text-ink' : 'text-stone-400'}`}>{title}</span>
            {open ? null : <span className="mt-0.5 block truncate text-sm text-stone-500">{summary}</span>}
          </span>
        </button>
        <label className={`flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${visible ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
          <input type="checkbox" checked={visible} onChange={(event) => onVisible(event.target.checked)} aria-label={`${visible ? 'Hide' : 'Show'} ${title} on the home page`} />
          {visible ? 'Shown' : 'Hidden'}
        </label>
      </div>
      {open ? (
        <div id={panelId} className="space-y-3 border-t border-stone-200 px-4 py-4">
          <p className="text-sm text-stone-500">{hint}</p>
          {children}
        </div>
      ) : null}
    </section>
  );
}

function ProgramCard({ program, index, total, onPatch, onMove, onRemove }: { program: Program; index: number; total: number; onPatch: (patch: Partial<Program>) => void; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
          <ChevronRight className={`shrink-0 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`} size={16} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{program.title || `Card ${index + 1}`}</span>
            {open ? null : <span className="mt-0.5 block truncate text-xs text-stone-500">{program.summary || 'No summary yet'}</span>}
          </span>
        </button>
        <div className="flex shrink-0 gap-3 text-sm">
          <button type="button" className="font-semibold text-brand disabled:opacity-40" disabled={index === 0} onClick={() => onMove(-1)}>Earlier</button>
          <button type="button" className="font-semibold text-brand disabled:opacity-40" disabled={index === total - 1} onClick={() => onMove(1)}>Later</button>
          <button type="button" className="text-red-700" onClick={onRemove}>Remove</button>
        </div>
      </div>
      {open ? (
        <div id={panelId} className="space-y-3 border-t border-stone-200 px-3 py-3">
          <ImageField label="Image" src={program.image} onChange={(image) => onPatch({ image })} />
          <label className="block text-sm font-medium">Title<input className={field} value={program.title} onChange={(event) => onPatch({ title: event.target.value })} /></label>
          <label className="block text-sm font-medium">Summary<textarea className={field} rows={3} value={program.summary} onChange={(event) => onPatch({ summary: event.target.value })} /></label>
          <label className="block text-sm font-medium">Icon
            <select className={field} value={program.icon} onChange={(event) => onPatch({ icon: event.target.value as Program['icon'] })}>
              {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{ICON_LABELS[icon]}</option>)}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}

function patchCard(cards: Program[], index: number, patch: Partial<Program>) {
  return cards.map((card, item) => item === index ? { ...card, ...patch } : card);
}

function moveCard(cards: Program[], index: number, direction: -1 | 1) {
  const next = index + direction;
  if (next < 0 || next >= cards.length) return cards;
  const copy = [...cards];
  const [card] = copy.splice(index, 1);
  copy.splice(next, 0, card);
  return copy;
}

function ImageField({ label, src, fit = 'cover', onChange }: { label: string; src: string; fit?: 'cover' | 'contain'; onChange: (src: string) => void }) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const { show } = useDeskNotice();
  const pick = async (file: File | undefined) => {
    if (!file || busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      onChange(await upload(file));
      show('success', 'Image ready. Save to publish it.');
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return (
    <label className="block text-sm font-medium">{label}
      <input type="file" accept="image/*" disabled={pending} className="mt-1 block text-sm" onChange={(event) => pick(event.target.files?.[0])} />
      {src ? <img src={src} alt="" className={`mt-3 h-32 w-full rounded-lg bg-stone-50 ${fit === 'contain' ? 'object-contain' : 'object-cover'}`} /> : null}
    </label>
  );
}

export function HomePageDesk({ home, stats, cta, programs }: { home: HomePageSettings; stats: SiteData['stats']; cta: SiteData['cta']; programs: Program[] }) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(home);
  const [numbers, setNumbers] = useState(stats);
  const [appeal, setAppeal] = useState(cta);
  const [cards, setCards] = useState(() => programs.map((program) => ({ ...program, image: programPhoto(program) })));
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
        body: JSON.stringify({ home: form, stats: numbers, cta: appeal, programs: cards }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The home page could not be saved.');
        return;
      }
      show('success', 'Saved. The home page is updated.');
      router.refresh();
    } catch {
      show('error', 'The home page could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-4 border-0 p-0">
        <Section title="Impact numbers" summary={`${numbers.length} ${numbers.length === 1 ? 'number' : 'numbers'}`} hint="The figures under the hero." visible={form.stats.visible} onVisible={(visible) => setForm({ ...form, stats: { ...form.stats, visible } })}>
          <ImageField label="Background image" src={form.stats.image} onChange={(image) => setForm({ ...form, stats: { ...form.stats, image } })} />
          <div className="flex justify-end">
            <button type="button" className="text-sm font-semibold text-brand disabled:opacity-40" disabled={numbers.length >= 6} onClick={() => setNumbers([...numbers, { value: '', label: '' }])}>Add number</button>
          </div>
          {numbers.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={field} value={item.value} placeholder="1,200+" aria-label={`Stat ${index + 1} value`} onChange={(event) => setNumbers(numbers.map((row, i) => i === index ? { ...row, value: event.target.value } : row))} />
              <input className={field} value={item.label} placeholder="People supported" aria-label={`Stat ${index + 1} label`} onChange={(event) => setNumbers(numbers.map((row, i) => i === index ? { ...row, label: event.target.value } : row))} />
              <button type="button" className="text-sm text-red-700" onClick={() => setNumbers(numbers.filter((_, i) => i !== index))}>Remove</button>
            </div>
          ))}
        </Section>

        <Section title="Where the work goes" summary={`${form.work.title || 'No heading yet'} · ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`} hint="The introduction and each program card, including its photograph." visible={form.work.visible} onVisible={(visible) => setForm({ ...form, work: { ...form.work, visible } })}>
          <label className="block text-sm font-medium">Eyebrow<input className={field} value={form.work.eyebrow} onChange={(event) => setForm({ ...form, work: { ...form.work, eyebrow: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Heading<input className={field} value={form.work.title} onChange={(event) => setForm({ ...form, work: { ...form.work, title: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Text<textarea className={field} rows={3} value={form.work.text} onChange={(event) => setForm({ ...form, work: { ...form.work, text: event.target.value } })} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">Link under the cards<input className={field} value={form.work.linkLabel} onChange={(event) => setForm({ ...form, work: { ...form.work, linkLabel: event.target.value } })} /></label>
            <label className="block text-sm font-medium">Card link<input className={field} value={form.work.cardLabel} onChange={(event) => setForm({ ...form, work: { ...form.work, cardLabel: event.target.value } })} /></label>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm font-semibold text-ink">Program cards</p>
            <button type="button" className="text-sm font-semibold text-brand disabled:opacity-40" disabled={cards.length >= 12} onClick={() => setCards([...cards, { id: '', slug: '', title: '', summary: '', body: '', image: '', icon: 'heart' }])}>Add card</button>
          </div>
          {cards.map((program, index) => (
            <ProgramCard
              key={program.id || index}
              program={program}
              index={index}
              total={cards.length}
              onPatch={(patch) => setCards(patchCard(cards, index, patch))}
              onMove={(direction) => setCards(moveCard(cards, index, direction))}
              onRemove={() => setCards(cards.filter((_, item) => item !== index))}
            />
          ))}
        </Section>

        <Section title="Who we are" summary={form.about.title || 'No heading yet'} hint="The story block with a photograph. Leave the photograph empty to use the about page photo." visible={form.about.visible} onVisible={(visible) => setForm({ ...form, about: { ...form.about, visible } })}>
          <label className="block text-sm font-medium">Eyebrow<input className={field} value={form.about.eyebrow} onChange={(event) => setForm({ ...form, about: { ...form.about, eyebrow: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Heading<input className={field} value={form.about.title} onChange={(event) => setForm({ ...form, about: { ...form.about, title: event.target.value } })} /></label>
          <label className="block text-sm font-medium">First paragraph<textarea className={field} rows={4} value={form.about.text} onChange={(event) => setForm({ ...form, about: { ...form.about, text: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Second paragraph<textarea className={field} rows={3} value={form.about.detail} onChange={(event) => setForm({ ...form, about: { ...form.about, detail: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Quote<input className={field} value={form.about.quote} onChange={(event) => setForm({ ...form, about: { ...form.about, quote: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Button label<input className={field} value={form.about.linkLabel} onChange={(event) => setForm({ ...form, about: { ...form.about, linkLabel: event.target.value } })} /></label>
          <ImageField label="Photograph" src={form.about.image} onChange={(image) => setForm({ ...form, about: { ...form.about, image } })} />
        </Section>

        <Section title="Be part of the change" summary={appeal.title || 'No heading yet'} hint="The donation banner. The heading and text are shared with the donation banner editor." visible={form.donation.visible} onVisible={(visible) => setForm({ ...form, donation: { ...form.donation, visible } })}>
          <label className="block text-sm font-medium">Heading<input className={field} value={appeal.title} onChange={(event) => setAppeal({ ...appeal, title: event.target.value })} /></label>
          <label className="block text-sm font-medium">Text<textarea className={field} rows={3} value={appeal.text} onChange={(event) => setAppeal({ ...appeal, text: event.target.value })} /></label>
          <label className="block text-sm font-medium">Button label<input className={field} value={form.donation.buttonLabel} onChange={(event) => setForm({ ...form, donation: { ...form.donation, buttonLabel: event.target.value } })} /></label>
          <ImageField label="Logo" src={form.donation.image} fit="contain" onChange={(image) => setForm({ ...form, donation: { ...form.donation, image } })} />
        </Section>

        <Section title="News & Updates" summary={form.news.title || 'No heading yet'} hint="The latest stories at the bottom of the home page." visible={form.news.visible} onVisible={(visible) => setForm({ ...form, news: { ...form.news, visible } })}>
          <label className="block text-sm font-medium">Eyebrow<input className={field} value={form.news.eyebrow} onChange={(event) => setForm({ ...form, news: { ...form.news, eyebrow: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Heading<input className={field} value={form.news.title} onChange={(event) => setForm({ ...form, news: { ...form.news, title: event.target.value } })} /></label>
          <label className="block text-sm font-medium">Link label<input className={field} value={form.news.linkLabel} onChange={(event) => setForm({ ...form, news: { ...form.news, linkLabel: event.target.value } })} /></label>
        </Section>

        <div className="sticky bottom-4 flex justify-end">
          <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{pending ? 'Saving…' : 'Save home page'}</button>
        </div>
      </fieldset>
    </form>
  );
}
