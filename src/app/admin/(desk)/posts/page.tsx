import Link from 'next/link';
import { POST_SECTIONS } from '@/lib/admin-posts';

export default function PostsPage() {
  return (
    <main>
      <h1 className="text-3xl">News & events</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Choose what you want to write. Each one has its own form.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {POST_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-card">
            <p className="text-lg text-ink">{section.label}</p>
            <p className="mt-1 text-sm text-stone-600">{section.hint}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
