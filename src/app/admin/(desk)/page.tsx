import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { getSite } from '@/lib/store';

export default async function AdminHome() {
  const [site, user] = await Promise.all([getSite(), currentUser()]);
  const paid = site.donations.filter((item) => item.status === 'paid');
  const cards = [
    { href: '/admin/donations', label: 'Paid donations', value: paid.length },
    { href: '/admin/donors', label: 'Donors', value: paid.length },
    { href: '/admin/volunteers', label: 'Volunteers', value: site.volunteers.length },
    { href: '/admin/posts/events', label: 'Events', value: site.posts.filter((item) => item.kind === 'event').length },
    { href: '/admin/posts/news', label: 'News', value: site.posts.filter((item) => item.kind === 'news').length },
    { href: '/admin/posts/blog', label: 'Blogs', value: site.posts.filter((item) => item.kind === 'blog').length },
    { href: '/admin/images', label: 'Images', value: site.images.length },
    { href: '/admin/users', label: 'Users', value: site.users.length },
  ].filter((card) => card.href !== '/admin/users' || user?.role === 'admin');
  return (
    <main>
      <h1 className="text-3xl">Desk</h1>
      <p className="mt-2 text-sm text-stone-600">Edit the public pages, photographs, and news from here.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-stone-500">{card.label}</p>
            <p className="mt-1 text-3xl text-brand">{card.value}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
