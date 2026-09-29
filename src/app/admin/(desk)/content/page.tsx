import Link from 'next/link';
import { CONTENT_SECTIONS } from '@/lib/admin-content';

export default function ContentPage() {
  return (
    <main>
      <h1 className="text-3xl">Content</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Choose a page to edit. Each section saves on its own.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONTENT_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-card">
            <p className="text-lg text-ink">{section.label}</p>
            <p className="mt-1 text-sm text-stone-600">{section.hint}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
