import Link from 'next/link';
import { getSite } from '@/lib/store';

export default function AdminHome() {
  const site = getSite();
  const paid = site.donations.filter((item) => item.status === 'paid');
  const cards = [
    { href: '/admin/posts', label: 'Published updates', value: site.posts.filter((item) => item.published).length },
    { href: '/admin/gallery', label: 'Gallery images', value: site.gallery.length },
    { href: '/admin/messages', label: 'Messages', value: site.messages.length },
    { href: '/admin/donors', label: 'Donors', value: paid.length },
    { href: '/admin/donations', label: 'Paid donations', value: paid.length },
  ];
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
