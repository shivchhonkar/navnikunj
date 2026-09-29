'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { Post, PostKind } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

type Draft = {
  kind: PostKind;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  date: string;
  location: string;
  keywords: string;
  published: boolean;
};

function blank(kind: PostKind): Draft {
  return { kind, title: '', excerpt: '', body: '', image: '', date: '', location: '', keywords: '', published: true };
}

function fromPost(post: Post): Draft {
  return {
    kind: post.kind,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    image: post.image,
    date: post.date,
    location: post.location,
    keywords: post.keywords || '',
    published: post.published,
  };
}

async function upload(file: File) {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

export function PostsDesk({ posts, kind, noun, title, modal = false, pageSize = 0 }: { posts: Post[]; kind: PostKind; noun: string; title?: string; modal?: boolean; pageSize?: number }) {
  const router = useRouter();
  const busy = useRef(false);
  const [form, setForm] = useState<Draft>(blank(kind));
  const [editing, setEditing] = useState('');
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [imageKey, setImageKey] = useState(0);
  const [page, setPage] = useState(1);
  const { show, clear } = useDeskNotice();
  const list = posts.filter((post) => post.kind === kind);
  const pages = pageSize > 0 ? Math.max(1, Math.ceil(list.length / pageSize)) : 1;
  const safePage = Math.min(page, pages);
  const visible = pageSize > 0 ? list.slice((safePage - 1) * pageSize, safePage * pageSize) : list;
  const showForm = modal ? open : true;

  const close = () => {
    if (busy.current) return;
    setOpen(false);
    setEditing('');
    setForm(blank(kind));
    setImageKey((key) => key + 1);
  };

  useEffect(() => {
    if (!modal || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [modal, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    clear();
    try {
      const response = await fetch(editing ? `/api/admin/posts/${editing}` : '/api/admin/posts', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kind }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The post could not be saved.');
        return;
      }
      const savedExisting = Boolean(editing);
      setForm(blank(kind));
      setEditing('');
      setImageKey((key) => key + 1);
      setOpen(false);
      show('success', savedExisting ? 'Post saved.' : 'Post added.');
      router.refresh();
    } catch {
      show('error', 'The post could not be saved. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setRemovingId(id);
    clear();
    try {
      const response = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The post could not be deleted.');
        return;
      }
      if (editing === id) close();
      show('success', 'Post deleted.');
      router.refresh();
    } catch {
      show('error', 'The post could not be deleted. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  const onImage = async (file: File | undefined) => {
    if (!file || busy.current) return;
    const ready = new File([await file.arrayBuffer()], file.name, { type: file.type });
    busy.current = true;
    setPending(true);
    clear();
    try {
      const image = await upload(ready);
      setForm((current) => ({ ...current, image }));
      show('success', 'Image ready. Save to attach it to this post.');
    } catch (reason) {
      show('error', reason instanceof Error ? reason.message : 'The image could not be uploaded.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const formFields = (
    <form onSubmit={submit} className={modal ? '' : 'rounded-2xl bg-white p-5 shadow-sm'} aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-3 border-0 p-0">
        {!modal ? <h2 className="text-2xl">{editing ? `Edit ${noun}` : `New ${noun}`}</h2> : null}
        <label className="block text-sm font-medium">Title<input required className={field} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="block text-sm font-medium">Date<input type="date" className={field} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <label className="block text-sm font-medium">Location<input className={field} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
        <label className="block text-sm font-medium">Summary<textarea className={field} rows={2} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></label>
        <label className="block text-sm font-medium">Story<textarea className={field} rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></label>
        <label className="block text-sm font-medium">Image
          <input key={imageKey} type="file" accept="image/*" className="mt-1 block text-sm disabled:cursor-not-allowed" onChange={(event) => onImage(event.target.files?.[0])} />
        </label>
        {form.image ? <img src={form.image} alt="" className="h-24 rounded-lg object-cover" /> : null}
        <div className="space-y-3 rounded-xl border border-stone-200 p-3">
          <p className="text-sm font-semibold">SEO</p>
          <label className="block text-sm font-medium">Keywords
            <input className={field} value={form.keywords} placeholder="school kits, education, children" onChange={(event) => setForm({ ...form, keywords: event.target.value })} />
          </label>
          <p className="text-xs text-stone-500">Comma-separated words for the page’s search keywords.</p>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Published</label>
        <div className="flex gap-2">
          <button disabled={pending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
          {(modal || editing) && <button type="button" className="text-sm" onClick={close}>Cancel</button>}
        </div>
      </fieldset>
    </form>
  );

  const listView = (
    <div>
      <ul className="space-y-3">
        {visible.map((post) => (
          <li key={post.id} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-stone-200">
              {post.image ? <img src={post.image} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-brand">{post.published ? 'Published' : 'Hidden'}</p>
              <h3 className="mt-1 text-xl">{post.title}</h3>
              <p className="text-sm text-stone-500">{post.date}{post.location ? ` · ${post.location}` : ''}</p>
              {post.keywords ? <p className="mt-1 truncate text-xs text-stone-400">{post.keywords}</p> : null}
              <div className="mt-2 flex gap-3 text-sm">
                <button type="button" disabled={Boolean(removingId) || pending} className="font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { setEditing(post.id); setForm(fromPost(post)); setImageKey((key) => key + 1); setOpen(true); clear(); }}>Edit</button>
                <button type="button" disabled={Boolean(removingId) || pending} className="text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(post.id)}>{removingId === post.id ? 'Deleting…' : 'Delete'}</button>
              </div>
            </div>
          </li>
        ))}
        {!list.length && <li className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-stone-500">Nothing here yet.</li>}
      </ul>
      {pageSize > 0 && list.length > 0 ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-stone-500">Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, list.length)} of {list.length}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-full border border-stone-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="text-stone-600">{safePage} / {pages}</span>
            <button type="button" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)} className="rounded-full border border-stone-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div>
      {modal ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h1 className="text-3xl">{title}</h1> : <span />}
          <button type="button" onClick={() => { setEditing(''); setForm(blank(kind)); setImageKey((key) => key + 1); setOpen(true); }} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      ) : null}
      <div className={modal ? '' : 'grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'}>
        {!modal && showForm ? formFields : null}
        {listView}
      </div>
      {modal && open ? (
        <div className="fixed bottom-0 right-0 top-16 z-20 overflow-y-auto bg-black/50 p-4 left-0 lg:left-64 lg:p-6" onClick={close}>
          <div role="dialog" aria-modal="true" aria-label={editing ? `Edit ${noun}` : `New ${noun}`} className="ml-auto w-full rounded-2xl bg-white p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl">{editing ? `Edit ${noun}` : `New ${noun}`}</h2>
              <button type="button" onClick={close} className="rounded-md p-2 text-stone-500 hover:bg-stone-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {formFields}
          </div>
        </div>
      ) : null}
    </div>
  );
}
