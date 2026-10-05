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
  const [fileKey, setFileKey] = useState(0);
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
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((image) => (
          <li key={image.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <img src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover" />
            <div className="p-3">
              <p className="text-sm text-stone-600">{image.caption || image.alt}</p>
              <button type="button" disabled={Boolean(removingId)} className="mt-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(image.id)}>
                {removingId === image.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
