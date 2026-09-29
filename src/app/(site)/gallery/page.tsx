import type { Metadata } from 'next';
import { GalleryView } from '@/components/GalleryView';
import { getSite } from '@/lib/store';

const BANNER_PHOTO = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2000&q=80';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photographs from Navnikunj Foundation programs and events.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  const images = getSite().gallery;
  return (
    <main>
      <section className="relative isolate overflow-hidden text-white">
        <img src={BANNER_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/15 via-ink/45 to-ink/75" />
        <div className="shell relative flex min-h-[13rem] items-center py-12 md:min-h-[17rem] md:justify-end">
          <div className="max-w-lg md:text-right">
            <h1 className="heading-xl">Gallery</h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">Photographs from programs, visits, and community work</p>
          </div>
        </div>
      </section>
      <div className="section shell">
        {images.length ? (
          <GalleryView images={images} />
        ) : (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-stone-500">No photographs yet. Add them from the admin gallery.</p>
        )}
      </div>
    </main>
  );
}
