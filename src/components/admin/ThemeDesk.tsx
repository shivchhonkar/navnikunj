'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { DEFAULT_THEME, THEME_FIELDS } from '@/lib/theme';
import type { SiteTheme } from '@/lib/types';

export function ThemeEditor({ theme }: { theme: SiteTheme }) {
  const router = useRouter();
  const busy = useRef(false);
  const [form, setForm] = useState(theme);
  const [pending, setPending] = useState(false);
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
        body: JSON.stringify({ theme: form }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The colours could not be saved.');
        return;
      }
      show('success', 'Saved. The public site is updated.');
      router.refresh();
    } catch {
      show('error', 'The colours could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl rounded-2xl bg-white p-5 shadow-sm" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-5 border-0 p-0">
        <div className="overflow-hidden rounded-xl border border-stone-200">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white" style={{ background: form.chrome }}>
            <span>Header</span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: form.brand }}>Donate</span>
          </div>
          <div className="relative h-24" style={{ background: form.heroDark }}>
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(90deg, ${form.heroLight} 0%, ${form.heroLight}b0 28%, transparent 70%)` }}
            />
            <p className="relative px-4 py-6 text-sm" style={{ color: form.heroDark }}>Hero banner</p>
          </div>
          <div className="px-4 py-3 text-sm" style={{ background: form.background, color: form.heroDark }}>
            Page background with <span style={{ color: form.brand }}>theme colour</span>
          </div>
        </div>
        {THEME_FIELDS.map((item) => (
          <label key={item.key} className="block">
            <span className="text-sm font-medium text-ink">{item.label}</span>
            <span className="mt-0.5 block text-sm text-stone-600">{item.hint}</span>
            <span className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(form[item.key]) ? form[item.key] : '#000000'}
                onChange={(event) => setForm({ ...form, [item.key]: event.target.value })}
                className="h-11 w-14 cursor-pointer rounded border border-stone-300 bg-white p-1"
                aria-label={item.label}
              />
              <input
                value={form[item.key]}
                onChange={(event) => setForm({ ...form, [item.key]: event.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm uppercase"
                spellCheck={false}
                maxLength={7}
              />
            </span>
          </label>
        ))}
        <div className="flex flex-wrap gap-3">
          <button disabled={pending} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
          <button
            type="button"
            disabled={pending}
            className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            onClick={() => {
              setForm({ ...DEFAULT_THEME });
              show('success', 'Original colours are filled in. Save to apply them.');
            }}
          >
            Restore original colours
          </button>
        </div>
      </fieldset>
    </form>
  );
}
