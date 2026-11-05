'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { GalleryImage } from '@/lib/types';

export function GalleryDesk({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [savingId, setSavingId] = useState('');
  const [fileKey, setFileKey] = useState(0);
  const [editFileKey, setEditFileKey] = useState(0);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [items, setItems] = useState(images);
  const { show, clear } = useDeskNotice();

  useEffect(() => {
    setItems(images);
  }, [images]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    clear();
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const file = data.get('file');
    if (!(file instanceof File) || !file.size) {
      show('error', 'Choose an image before adding it to the gallery.');
      return;
    }
    const uploadFile = new File([await file.arrayBuffer()], file.name, { type: file.type });
    busy.current = true;
    setPending(true);
    try {
      const upload = new FormData();
      upload.set('file', uploadFile);
      const uploaded = await fetch('/api/admin/upload', { method: 'POST', body: upload });
      const fileData = await uploaded.json().catch(() => ({}));
      if (!uploaded.ok) {
        show('error', fileData.error || 'The image could not be uploaded.');
        return;
      }
      const saved = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileData.id, src: fileData.url, alt: data.get('alt'), caption: data.get('caption') }),
      });
      const savedData = await saved.json().catch(() => ({}));
      if (!saved.ok || !savedData.image) {
        show('error', savedData.error || 'The image uploaded, but it could not be added to the gallery.');
        return;
      }
      setItems((current) => [savedData.image as GalleryImage, ...current.filter((item) => item.id !== savedData.image.id)]);
      form.reset();
      setFileKey((key) => key + 1);
      show('success', 'Photo added to the gallery.');
      router.refresh();
    } catch {
      show('error', 'The gallery could not be updated. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const beginEdit = (image: GalleryImage) => {
    clear();
    setEditing(image);
    setEditAlt(image.alt);
    setEditCaption(image.caption);
    setEditFileKey((key) => key + 1);
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || busy.current) return;
    clear();
    const form = event.currentTarget;
    const file = new FormData(form).get('file');
    busy.current = true;
    setSavingId(editing.id);
    try {
      let src = '';
      if (file instanceof File && file.size) {
        const uploadFile = new File([await file.arrayBuffer()], file.name, { type: file.type });
        const upload = new FormData();
        upload.set('file', uploadFile);
        const uploaded = await fetch('/api/admin/upload', { method: 'POST', body: upload });
        const fileData = await uploaded.json().catch(() => ({}));
        if (!uploaded.ok || !fileData.url) {
          show('error', fileData.error || 'The replacement image could not be uploaded.');
          return;
        }
        src = fileData.url;
      }
      const saved = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, alt: editAlt, caption: editCaption, ...(src ? { src } : {}) }),
      });
      const savedData = await saved.json().catch(() => ({}));
      if (!saved.ok || !savedData.image) {
        show('error', savedData.error || 'The photograph could not be updated.');
        return;
      }
      const image = savedData.image as GalleryImage;
      setItems((current) => current.map((item) => (item.id === image.id ? image : item)));
      setEditing(null);
      show('success', 'Photograph updated.');
      router.refresh();
    } catch {
      show('error', 'The photograph could not be updated. Try again.');
    } finally {
      busy.current = false;
      setSavingId('');
    }
  };

  const remove = async (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setRemovingId(id);
    clear();
    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', data.error || 'The photo could not be removed.');
        return;
      }
      setItems((current) => current.filter((item) => item.id !== id));
      show('success', 'Photo removed from the gallery.');
      router.refresh();
    } catch {
      show('error', 'The photo could not be removed. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  return (
    <div>
      <form ref={formRef} onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm" aria-busy={pending}>
        <fieldset disabled={pending} className="grid min-w-0 gap-3 border-0 p-0 md:grid-cols-2">
          <label className="text-sm font-medium md:col-span-2">Image
            <input key={fileKey} name="file" type="file" accept="image/*" className="mt-1 block w-full text-sm disabled:cursor-not-allowed" />
          </label>
          <label className="text-sm font-medium">Alt text
            <input name="alt" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100" placeholder="What the photo shows" />
          </label>
          <label className="text-sm font-medium">Caption
            <input name="caption" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100" />
          </label>
          <button disabled={pending} className="w-fit rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Adding…' : 'Add to gallery'}</button>
        </fieldset>
      </form>
      {editing ? (
        <form onSubmit={saveEdit} className="mt-4 rounded-2xl bg-white p-5 shadow-sm" aria-busy={savingId === editing.id}>
          <h2 className="text-base font-semibold">Edit photograph</h2>
          <fieldset disabled={savingId === editing.id} className="mt-3 grid min-w-0 gap-3 border-0 p-0 md:grid-cols-2">
            <div className="md:col-span-2">
              <img src={editing.src} alt={editAlt || editing.alt} className="h-36 w-56 rounded-xl object-cover" />
            </div>
            <label className="text-sm font-medium md:col-span-2">Replace image
              <input key={editFileKey} name="file" type="file" accept="image/*" className="mt-1 block w-full text-sm disabled:cursor-not-allowed" />
              <span className="mt-1 block text-xs font-normal text-stone-500">Leave this empty to keep the current photograph.</span>
            </label>
            <label className="text-sm font-medium">Alt text
              <input value={editAlt} onChange={(event) => setEditAlt(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100" placeholder="What the photo shows" />
            </label>
            <label className="text-sm font-medium">Caption
              <input value={editCaption} onChange={(event) => setEditCaption(event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100" />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button disabled={savingId === editing.id} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{savingId === editing.id ? 'Saving…' : 'Save changes'}</button>
              <button type="button" disabled={savingId === editing.id} onClick={() => setEditing(null)} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
            </div>
          </fieldset>
        </form>
      ) : null}
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((image) => (
          <li key={image.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <img src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover" />
            <div className="p-3">
              <p className="text-sm text-stone-600">{image.caption || image.alt}</p>
              <div className="mt-2 flex gap-3">
                <button type="button" disabled={Boolean(removingId) || Boolean(savingId)} className="text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50" onClick={() => beginEdit(image)}>Edit</button>
                <button type="button" disabled={Boolean(removingId) || Boolean(savingId)} className="text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(image.id)}>
                  {removingId === image.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
