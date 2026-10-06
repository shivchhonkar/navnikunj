'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import type { AppUser, UserRole } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

export function UsersDesk({ users, currentId }: { users: AppUser[]; currentId: string }) {
  const router = useRouter();
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(users);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.get('username'),
          password: data.get('password'),
          displayName: data.get('displayName'),
          email: data.get('email'),
          role: data.get('role'),
        }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok || !saved.user) {
        show('error', saved.error || 'The user could not be saved.');
        return;
      }
      setRows((current) => [...current, saved.user as AppUser]);
      form.reset();
      show('success', 'User added. They can sign in with that username.');
      router.refresh();
    } catch {
      show('error', 'The user could not be saved. Try again.');
    } finally {
      setPending(false);
    }
  };

  const save = async (row: AppUser, change: Partial<AppUser>) => {
    clear();
    const next = { ...row, ...change };
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: next.id, displayName: next.displayName, email: next.email, role: next.role, active: next.active, password: '' }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The user could not be updated.');
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? next : item));
    router.refresh();
  };

  const remove = async (id: string) => {
    clear();
    const response = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The user could not be removed.');
      return;
    }
    setRows((current) => current.filter((item) => item.id !== id));
    show('success', 'User removed.');
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm" aria-busy={pending}>
        <fieldset disabled={pending} className="grid gap-3 border-0 p-0 md:grid-cols-2">
          <label className="text-sm font-medium">Username
            <input name="username" required autoComplete="off" className={field} placeholder="coordinator" />
          </label>
          <label className="text-sm font-medium">Password
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
          </label>
          <label className="text-sm font-medium">Display name
            <input name="displayName" className={field} />
          </label>
          <label className="text-sm font-medium">Email
            <input name="email" type="email" className={field} />
          </label>
          <label className="text-sm font-medium">Role
            <select name="role" className={field} defaultValue="editor">
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          <div className="flex items-end">
            <button disabled={pending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving…' : 'Add user'}</button>
          </div>
        </fieldset>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold">{row.displayName || row.username}</p>
              <p className="text-sm text-stone-500">{row.username}{row.email ? ` · ${row.email}` : ''}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {row.role === 'superAdmin' ? (
                <span className="text-sm font-medium text-stone-700">Super administrator</span>
              ) : (
                <select aria-label={`Role for ${row.username}`} value={row.role} onChange={(event) => save(row, { role: event.target.value as UserRole })} className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                  <option value="admin">Administrator</option>
                  <option value="editor">Editor</option>
                </select>
              )}
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={row.active} disabled={row.role === 'superAdmin'} onChange={(event) => save(row, { active: event.target.checked })} />
                Active
              </label>
              {row.id !== currentId && row.role !== 'superAdmin' ? <button type="button" onClick={() => remove(row.id)} className="text-sm text-red-700">Remove</button> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
