'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, MapPin, Share2 } from 'lucide-react';
import { DonateForm } from '@/components/DonateForm';
import { inr } from '@/lib/causes';
import type { Cause } from '@/lib/types';

type RecentGift = { name: string; amount: number; at: string };

function ago(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `about ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `about ${days} day${days === 1 ? '' : 's'} ago`;
}

export function CauseKart({
  cause,
  recent,
  provider,
  configured,
}: {
  cause: Cause;
  recent: RecentGift | null;
  provider: 'cashfree' | 'razorpay';
  configured: boolean;
}) {
  const photos = cause.images.length ? cause.images : [cause.image].filter(Boolean);
  const [photo, setPhoto] = useState(0);
  const [mode, setMode] = useState<'products' | 'money'>('products');
  const [qty, setQty] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const [pay, setPay] = useState<{ lock: boolean; amount?: number } | null>(null);
  const [payHint, setPayHint] = useState('');
  const [mounted, setMounted] = useState(false);
  const total = useMemo(
    () => cause.products.reduce((sum, item) => sum + (qty[item.id] || 0) * item.price, 0),
    [cause.products, qty],
  );
  const current = photos[photo] || cause.image;
  const progress = cause.goal > 0 ? Math.min(100, Math.round((cause.raised / cause.goal) * 100)) : 0;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: cause.title, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const add = (id: string) => {
    setPayHint('');
    setQty((currentQty) => ({ ...currentQty, [id]: (currentQty[id] || 0) + 1 }));
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!pay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPay(null);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [pay]);

  const openMoney = () => {
    setPayHint('');
    setPay({ lock: false });
  };

  const openProducts = () => {
    if (total < 1) {
      setPayHint('Add at least one product.');
      return;
    }
    setPayHint('');
    setPay({ lock: true, amount: total });
  };

  return (
    <div className="shell grid items-start gap-8 pb-section lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      <div>
        <div className="relative overflow-hidden rounded-card bg-sand shadow-card">
          {current ? <img src={current} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] w-full" />}
          {cause.taxBenefit ? (
            <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Tax benefits</span>
          ) : null}
          {cause.caption ? (
            <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-brand">{cause.caption}</span>
          ) : null}
          {photos.length > 1 ? (
            <>
              <button type="button" aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow" onClick={() => setPhoto((index) => (index - 1 + photos.length) % photos.length)}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Next photo" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow" onClick={() => setPhoto((index) => (index + 1) % photos.length)}>
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((src, index) => (
                  <button key={src + index} type="button" aria-label={`Photo ${index + 1}`} className={`h-2 w-2 rounded-full ${index === photo ? 'bg-brand' : 'bg-white/80'}`} onClick={() => setPhoto(index)} />
                ))}
              </div>
            </>
          ) : null}
        </div>
        <div className="mt-6">
          <h1 className="heading-lg text-ink">{cause.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>By {cause.organizer}</span>
            {cause.location ? <span className="inline-flex items-center gap-1"><MapPin size={14} /> {cause.location}</span> : null}
          </p>
          {cause.summary ? <p className="lead mt-4">{cause.summary}</p> : null}
          {cause.story ? <p className="lead mt-3">{cause.story}</p> : null}
          {cause.goal > 0 ? (
            <div className="mt-6">
              <div className="h-2 overflow-hidden rounded-full bg-sand">
                <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 flex justify-between text-sm">
                <span className="font-semibold text-ink">{inr(cause.raised)} raised</span>
                <span className="text-brand">{cause.donors.toLocaleString('en-IN')} donors</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden border border-line">
        <div className="grid grid-cols-2 border-b border-line">
          {(['products', 'money'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`px-4 py-3 text-sm font-semibold ${mode === item ? 'bg-brand text-white' : 'bg-white text-brand'}`}
              onClick={() => setMode(item)}
            >
              {item === 'products' ? 'Donate products' : 'Donate money'}
            </button>
          ))}
        </div>

        {mode === 'products' ? (
          <div className="space-y-5 p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-3">
              {cause.products.map((item) => {
                const count = qty[item.id] || 0;
                return (
                  <div key={item.id} className="text-center">
                    <div className="relative overflow-hidden rounded-xl border border-line bg-white">
                      {item.featured ? <span className="absolute left-1.5 top-1.5 rounded bg-sand px-1.5 py-0.5 text-[10px] font-semibold text-brand">Most impactful</span> : null}
                      {item.image ? <img src={item.image} alt="" className="mx-auto h-20 w-full object-contain p-2" /> : <div className="h-20" />}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      {count ? (
                        <>
                          <button type="button" aria-label={`Remove one ${item.name}`} className="rounded-lg border border-line px-2 py-1.5 text-sm text-ink" onClick={() => { setPayHint(''); setQty((currentQty) => ({ ...currentQty, [item.id]: Math.max(0, (currentQty[item.id] || 0) - 1) })); }}>−</button>
                          <span className="min-w-6 px-1 text-sm font-semibold text-ink">{count}</span>
                          <button type="button" aria-label={`Add one ${item.name}`} className="rounded-lg border border-brand px-2 py-1.5 text-sm font-semibold text-brand hover:bg-sand" onClick={() => add(item.id)}>+</button>
                        </>
                      ) : (
                        <button type="button" className="rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand hover:bg-sand" onClick={() => add(item.id)}>Add</button>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-muted">{item.needed.toLocaleString('en-IN')} qty needed</p>
                    <p className="text-sm font-semibold text-ink">{inr(item.price)}<span className="font-normal text-muted">/unit</span></p>
                  </div>
                );
              })}
            </div>
            {!cause.products.length ? <p className="text-sm text-muted">Products are not listed for this cause yet. You can still donate money.</p> : null}
            {recent ? (
              <p className="rounded-xl bg-sand px-3 py-2 text-center text-sm text-ink">
                {inr(recent.amount)} donated by {recent.name} {ago(recent.at)}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-brand flex-1"
                onClick={openProducts}
              >
                Donate now{total > 0 ? ` · ${inr(total)}` : ''}
              </button>
              <button type="button" className="btn btn-line px-4" aria-label="Share this cause" onClick={share}>
                <Share2 size={16} />
              </button>
            </div>
            {copied ? <p className="text-center text-xs text-brand">Link copied.</p> : null}
            {payHint ? <p className="text-sm text-red-700">{payHint}</p> : null}
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-5">
            <p className="text-sm leading-6 text-muted">Give any amount to {cause.title}. Your name and phone open in a form so you can pay securely.</p>
            <button type="button" className="btn btn-brand w-full" onClick={openMoney}>Donate now</button>
          </div>
        )}
      </div>
      {mounted && pay ? createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onClick={() => setPay(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={pay.lock ? `Donate ${inr(pay.amount || 0)}` : 'Donate'}
            className="w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <DonateForm
              key={pay.lock ? pay.amount : 'money'}
              provider={provider}
              configured={configured}
              causeSlug={cause.slug}
              causeTitle={cause.title}
              initialAmount={pay.amount}
              lockAmount={pay.lock}
              dialog
              onClose={() => setPay(null)}
            />
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
