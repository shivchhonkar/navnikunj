import type { Metadata } from 'next';
import { GalleryView } from '@/components/GalleryView';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photographs from Navnikunj Foundation programs and events.',
  alternates: { canonical: '/gallery' },
};

export default async function GalleryPage() {
  const site = await getSite();
  const images = site.gallery;
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'gallery')} />
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
