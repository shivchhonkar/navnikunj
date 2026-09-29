'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNotice, useAdminNotice } from '@/components/admin/AdminNotice';

export default function AdminLoginPage() {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const { notice, show, clear } = useAdminNotice();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    clear();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        show('error', data.error || 'Could not sign in.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      show('error', 'Could not sign in. Try again.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <AdminNotice notice={notice} onClose={clear} offset={false} />
      <img src="/images/logo.svg" alt="Navnikunj Foundation" className="mx-auto h-28 w-auto object-contain" />
      <h1 className="mt-4 text-center text-3xl">Admin login</h1>
      <form onSubmit={submit} className="mt-6 rounded-2xl bg-white p-5 shadow-card" aria-busy={pending}>
        <fieldset disabled={pending} className="min-w-0 space-y-4 border-0 p-0">
          <label className="block text-sm font-medium">Username
            <input name="username" required autoComplete="username" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 disabled:bg-stone-100" />
          </label>
          <label className="block text-sm font-medium">Password
            <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 disabled:bg-stone-100" />
          </label>
          <button disabled={pending} className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Signing in…' : 'Sign in'}</button>
        </fieldset>
      </form>
    </main>
  );
}
