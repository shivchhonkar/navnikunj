import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-4xl">Page not found</h1>
      <p className="mt-3 text-stone-600">That address is not on the site.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Back home</Link>
    </main>
  );
}
