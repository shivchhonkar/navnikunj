'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useDeskNotice } from '@/components/admin/AdminNotice';
import { PEOPLE_ROLES } from '@/lib/people';
import type { TeamPeopleCopy, Volunteer, VolunteerRole, VolunteerStatus } from '@/lib/types';

const field = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100';

const STATUS: { value: VolunteerStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

type RoleFilter = 'all' | VolunteerRole;

export function VolunteersDesk({ volunteers, teamPeople }: { volunteers: Volunteer[]; teamPeople: TeamPeopleCopy }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const { show, clear } = useDeskNotice();
  const [rows, setRows] = useState(volunteers);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [removingId, setRemovingId] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [photo, setPhoto] = useState('');
  const [copy, setCopy] = useState(teamPeople);
  const [copyPending, setCopyPending] = useState(false);

  const close = () => {
    if (pending) return;
    setOpen(false);
    setEditing(null);
  };

  useEffect(() => {
    setRows(volunteers);
  }, [volunteers]);

  useEffect(() => {
    setCopy(teamPeople);
  }, [teamPeople]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pending]);

  const visible = roleFilter === 'all' ? rows : rows.filter((row) => row.role === roleFilter);

  const upload = async (file: File) => {
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) throw new Error(data.error || 'The photo could not be uploaded.');
    return data.url as string;
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    clear();
    try {
      setPhoto(await upload(file));
    } catch (error) {
      show('error', error instanceof Error ? error.message : 'The photo could not be uploaded.');
    }
  };

  const openAdd = () => {
    setEditing(null);
    setPhoto('');
    setOpen(true);
  };

  const openEdit = (row: Volunteer) => {
    setEditing(row);
    setPhoto(row.image || '');
    setOpen(true);
  };

  const saveRow = async (row: Volunteer, patch: Partial<Volunteer>) => {
    if (busy.current) return;
    clear();
    const next = { ...row, ...patch };
    const response = await fetch('/api/admin/volunteers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    const saved = await response.json().catch(() => ({}));
    if (!response.ok) {
      show('error', saved.error || 'The change could not be saved.');
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? next : item));
    router.refresh();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const payload = {
      id: editing?.id,
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      city: data.get('city'),
      skills: data.get('skills'),
      availability: data.get('availability'),
      role: data.get('role'),
      title: data.get('title'),
      image: photo,
      status: data.get('status'),
      featured: data.get('featured') === 'on',
      notes: data.get('notes'),
    };
    busy.current = true;
    setPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/volunteers', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok || (!editing && !saved.volunteer)) {
        show('error', saved.error || 'The person could not be saved.');
        return;
      }
      if (editing) {
        setRows((current) => current.map((item) => item.id === editing.id ? {
          ...item,
          name: String(payload.name || ''),
          email: String(payload.email || ''),
          phone: String(payload.phone || ''),
          city: String(payload.city || ''),
          skills: String(payload.skills || ''),
          availability: String(payload.availability || ''),
          role: payload.role === 'support' || payload.role === 'fundraiser' ? payload.role : 'volunteer',
          title: String(payload.title || ''),
          image: photo,
          status: payload.status === 'active' || payload.status === 'inactive' ? payload.status : 'applied',
          featured: payload.featured,
          notes: String(payload.notes || ''),
        } : item));
        show('success', 'Details updated.');
      } else {
        setRows((current) => [saved.volunteer as Volunteer, ...current.filter((item) => item.id !== saved.volunteer.id)]);
        show('success', 'Person added.');
      }
      form.reset();
      setOpen(false);
      setEditing(null);
      router.refresh();
    } catch {
      show('error', 'The person could not be saved. Try again.');
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
      const response = await fetch('/api/admin/volunteers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', saved.error || 'The person could not be removed.');
        return;
      }
      setRows((current) => current.filter((item) => item.id !== id));
      show('success', 'Removed from the list.');
      router.refresh();
    } catch {
      show('error', 'The person could not be removed. Try again.');
    } finally {
      busy.current = false;
      setRemovingId('');
    }
  };

  const saveCopy = async (event: FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setCopyPending(true);
    clear();
    try {
      const response = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamPeople: copy }),
      });
      const saved = await response.json().catch(() => ({}));
      if (!response.ok) {
        show('error', saved.error || 'The section text could not be saved.');
        return;
      }
      show('success', 'Section text updated.');
      router.refresh();
    } catch {
      show('error', 'The section text could not be saved. Try again.');
    } finally {
      busy.current = false;
      setCopyPending(false);
    }
  };

  const filters: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...PEOPLE_ROLES.map((role) => ({ value: role.value, label: role.heading })),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Volunteers & supporters</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Applications from volunteers, the support team, and fund raisers. Active people marked “On site” appear by name, city, and skills. Phone and email stay in this desk.</p>
        </div>
        <button type="button" onClick={openAdd} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Add a person</button>
      </div>

      <form onSubmit={saveCopy} className="mb-6 max-w-3xl rounded-2xl bg-white p-4 shadow-sm" aria-busy={copyPending}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">With us section</h2>
            <p className="mt-1 text-sm text-stone-600">Shown on the team page, above the portraits.</p>
          </div>
          <label className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${copy.visible ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
            <input type="checkbox" checked={copy.visible} onChange={(event) => setCopy({ ...copy, visible: event.target.checked })} aria-label="Show the With us section on the team page" />
            {copy.visible ? 'Shown on team' : 'Hidden on team'}
          </label>
        </div>
        <fieldset disabled={copyPending} className="mt-4 grid gap-3 border-0 p-0">
          <label className="text-sm font-medium">Eyebrow
            <input value={copy.eyebrow} onChange={(event) => setCopy({ ...copy, eyebrow: event.target.value })} className={field} />
          </label>
          <label className="text-sm font-medium">Heading
            <input value={copy.heading} onChange={(event) => setCopy({ ...copy, heading: event.target.value })} className={field} />
          </label>
          <label className="text-sm font-medium">Subheading
            <textarea rows={3} value={copy.subheading} onChange={(event) => setCopy({ ...copy, subheading: event.target.value })} className={field} />
          </label>
          <div>
            <button disabled={copyPending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{copyPending ? 'Saving…' : 'Save section'}</button>
          </div>
        </fieldset>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const count = filter.value === 'all' ? rows.length : rows.filter((row) => row.role === filter.value).length;
          const selected = roleFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setRoleFilter(filter.value)}
              className={`rounded-full px-3 py-1.5 text-sm ${selected ? 'bg-brand text-white' : 'bg-white text-stone-700 shadow-sm'}`}
            >
              {filter.label} <span className={selected ? 'text-white/80' : 'text-stone-400'}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Skills</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">On site</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-t border-stone-100 align-top">
                <td className="px-3 py-3 font-medium">
                  {row.name}
                  {row.availability ? <p className="mt-1 text-xs font-normal text-stone-500">{row.availability}</p> : null}
                  {row.notes ? <p className="mt-1 max-w-xs whitespace-pre-wrap text-xs font-normal leading-5 text-stone-500">{row.notes}</p> : null}
                </td>
                <td className="px-3 py-3">
                  <select aria-label={`Role for ${row.name}`} value={row.role} onChange={(event) => saveRow(row, { role: event.target.value as VolunteerRole })} className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                    {PEOPLE_ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{row.phone}</td>
                <td className="px-3 py-3">{row.email || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{row.city || '—'}</td>
                <td className="px-3 py-3">{row.skills || '—'}</td>
                <td className="px-3 py-3">
                  <select aria-label={`Status for ${row.name}`} value={row.status} onChange={(event) => saveRow(row, { status: event.target.value as VolunteerStatus })} className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                    {STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Show ${row.name} on the website`}
                    checked={row.featured}
                    onChange={(event) => saveRow(row, { featured: event.target.checked })}
                  />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <button type="button" className="mr-3 text-sm text-brand" onClick={() => openEdit(row)}>Edit</button>
                  <button type="button" disabled={Boolean(removingId)} className="text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => remove(row.id)}>
                    {removingId === row.id ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
            {!visible.length && <tr><td className="px-3 py-6 text-stone-500" colSpan={9}>No one in this list yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed bottom-0 right-0 top-16 z-20 left-0 overflow-y-auto bg-white transition-[left] duration-200 lg:left-[var(--admin-side)]" onClick={close}>
          <div role="dialog" aria-modal="true" aria-labelledby="volunteer-form-title" className="min-h-full w-full bg-white px-6 py-6 lg:px-8" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="volunteer-form-title" className="text-2xl">{editing ? 'Edit person' : 'Add a person'}</h2>
              <button type="button" onClick={close} className="rounded-md p-2 text-stone-500 hover:bg-stone-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form key={editing?.id || 'new'} ref={formRef} onSubmit={submit} aria-busy={pending}>
              <fieldset disabled={pending} className="grid min-w-0 gap-3 border-0 p-0 md:grid-cols-2">
                <label className="text-sm font-medium">Name
                  <input name="name" required defaultValue={editing?.name || ''} className={field} />
                </label>
                <label className="text-sm font-medium">Phone
                  <input name="phone" required defaultValue={editing?.phone || ''} className={field} />
                </label>
                <label className="text-sm font-medium">Email
                  <input name="email" type="email" defaultValue={editing?.email || ''} className={field} />
                </label>
                <label className="text-sm font-medium">City
                  <input name="city" defaultValue={editing?.city || ''} className={field} />
                </label>
                <label className="text-sm font-medium">Role
                  <select name="role" className={field} defaultValue={editing?.role || 'volunteer'}>
                    {PEOPLE_ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium md:col-span-2">Title
                  <input name="title" defaultValue={editing?.title || ''} className={field} placeholder="Volunteer, donor, fund raiser" />
                </label>
                <div className="text-sm font-medium md:col-span-2">Photo
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {photo ? <img src={photo} alt="" className="h-16 w-14 rounded-lg object-cover" /> : null}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onPhoto(event.target.files?.[0])} className="text-sm" />
                    {photo ? <button type="button" className="text-sm text-stone-600" onClick={() => setPhoto('')}>Remove photo</button> : null}
                  </div>
                </div>
                <label className="text-sm font-medium">Status
                  <select name="status" className={field} defaultValue={editing?.status || 'applied'}>
                    {STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Skills
                  <input name="skills" defaultValue={editing?.skills || ''} className={field} placeholder="Teaching, health camp, driving" />
                </label>
                <label className="text-sm font-medium">Availability
                  <input name="availability" defaultValue={editing?.availability || ''} className={field} placeholder="Weekends" />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                  <input name="featured" type="checkbox" defaultChecked={editing?.featured || false} />
                  Show on the website when status is Active
                </label>
                <label className="text-sm font-medium md:col-span-2">Notes
                  <textarea name="notes" rows={3} defaultValue={editing?.notes || ''} className={field} />
                </label>
                <div className="flex items-end justify-end gap-3 md:col-span-2">
                  <button type="button" onClick={close} className="text-sm text-stone-600">Cancel</button>
                  <button disabled={pending} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : editing ? 'Save changes' : 'Save person'}</button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
