import Link from 'next/link';
import { ArrowUpRight, FileImage, HandCoins, IndianRupee, Mail, Newspaper, UserRound, Users, type LucideIcon } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { getSite } from '@/lib/store';
import { managesUsers } from '@/lib/types';

function money(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Metric({ href, label, value, detail, icon: Icon }: { href: string; label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <Link href={href} className="group rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sand text-brand">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-4 text-3xl text-ink">{value}</p>
      <p className="mt-2 flex items-center justify-between gap-3 text-sm text-stone-500">
        <span>{detail}</span>
        <ArrowUpRight size={16} className="shrink-0 text-stone-300 transition group-hover:text-brand" />
      </p>
    </Link>
  );
}

export default async function AdminHome() {
  const [site, user] = await Promise.all([getSite(), currentUser()]);
  const paid = site.donations.filter((item) => item.status === 'paid');
  const received = paid.reduce((sum, item) => sum + item.amount, 0);
  const applied = site.volunteers.filter((item) => item.status === 'applied');
  const activeVolunteers = site.volunteers.filter((item) => item.status === 'active');
  const drafts = site.posts.filter((item) => !item.published);
  const failed = site.donations.filter((item) => item.status === 'failed');
  const messages = site.messages.slice(0, 4);
  const volunteers = site.volunteers.slice(0, 4);
  const posts = site.posts.slice(0, 4);
  const showUsers = user ? managesUsers(user.role) : false;

  const attention = [
    applied.length ? { href: '/admin/volunteers', title: `${applied.length} volunteer${applied.length === 1 ? '' : 's'} applied`, detail: 'Review who has offered time.' } : null,
    drafts.length ? { href: '/admin/posts', title: `${drafts.length} update${drafts.length === 1 ? '' : 's'} still hidden`, detail: 'Publish news, a blog, or an event.' } : null,
    failed.length ? { href: '/admin/donations', title: `${failed.length} gift${failed.length === 1 ? '' : 's'} did not complete`, detail: 'Open donations and check the failed list.' } : null,
  ].filter((item): item is { href: string; title: string; detail: string } => Boolean(item));

  return (
    <main>
      {/* <h1 className="text-3xl">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Gifts, volunteers, messages, and updates. Open a card to work on that list.</p> */}

      <div className={`mt-6 grid gap-3 sm:grid-cols-2 ${showUsers ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        <Metric href="/admin/donations" label="Paid donations" value={money(received)} detail={`${paid.length} completed`} icon={IndianRupee} />
        <Metric href="/admin/donors" label="Donors" value={String(paid.length)} detail="From confirmed gifts" icon={HandCoins} />
        <Metric href="/admin/volunteers" label="Volunteers" value={String(site.volunteers.length)} detail={applied.length ? `${applied.length} waiting to review` : `${activeVolunteers.length} active`} icon={Users} />
        <Metric href="/admin/posts" label="News & events" value={String(site.posts.length)} detail={drafts.length ? `${drafts.length} hidden` : 'All published'} icon={Newspaper} />
        <Metric href="/admin/messages" label="Messages" value={String(site.messages.length)} detail={messages[0] ? `Latest from ${messages[0].name}` : 'Inbox is empty'} icon={Mail} />
        <Metric href="/admin/images" label="Images" value={String(site.images.length)} detail="In the library" icon={FileImage} />
        {showUsers ? <Metric href="/admin/users" label="Users" value={String(site.users.length)} detail="Accounts that can sign in" icon={UserRound} /> : null}
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg">Needs a look</h2>
          {attention.length ? (
            <ul className="mt-4 divide-y divide-stone-100">
              {attention.map((item) => (
                <li key={item.href + item.title}>
                  <Link href={item.href} className="flex items-center justify-between gap-3 py-3 hover:text-brand">
                    <span>
                      <span className="block text-sm font-semibold text-ink">{item.title}</span>
                      <span className="mt-0.5 block text-sm text-stone-500">{item.detail}</span>
                    </span>
                    <ArrowUpRight size={16} className="shrink-0 text-stone-300" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-stone-500">Nothing is waiting. New applications, hidden updates, and unfinished gifts show up here.</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Latest messages</h2>
            <Link href="/admin/messages" className="text-sm font-medium text-brand hover:text-brandDark">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-stone-100">
            {messages.map((message) => (
              <li key={message.id} className="py-3">
                <p className="text-sm font-semibold text-ink">{message.name}</p>
                <p className="mt-0.5 line-clamp-2 text-sm leading-6 text-stone-600">{message.message}</p>
                <p className="mt-1 text-xs text-stone-400">{when(message.at)}</p>
              </li>
            ))}
            {!messages.length ? <li className="py-3 text-sm text-stone-500">No messages yet.</li> : null}
          </ul>
        </section>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Volunteers</h2>
            <Link href="/admin/volunteers" className="text-sm font-medium text-brand hover:text-brandDark">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-stone-100">
            {volunteers.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-sm font-semibold text-ink">{person.name}</span>
                  <span className="mt-0.5 block text-sm text-stone-500">{[person.city, person.phone].filter(Boolean).join(' · ') || 'No contact details'}</span>
                </span>
                <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-xs font-medium capitalize text-stone-600">{person.status}</span>
              </li>
            ))}
            {!volunteers.length ? <li className="py-3 text-sm text-stone-500">No volunteers yet.</li> : null}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Updates</h2>
            <Link href="/admin/posts" className="text-sm font-medium text-brand hover:text-brandDark">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-stone-100">
            {posts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{post.title}</span>
                  <span className="mt-0.5 block text-sm capitalize text-stone-500">{post.kind}{post.date ? ` · ${when(post.date)}` : ''}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${post.published ? 'bg-emerald-50 text-emerald-800' : 'bg-sand text-stone-600'}`}>
                  {post.published ? 'Published' : 'Hidden'}
                </span>
              </li>
            ))}
            {!posts.length ? <li className="py-3 text-sm text-stone-500">No news or events yet.</li> : null}
          </ul>
        </section>
      </div>
    </main>
  );
}
