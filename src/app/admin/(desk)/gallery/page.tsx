import { GalleryDesk } from '@/components/admin/GalleryDesk';
import { getSite } from '@/lib/store';

export default async function GalleryAdminPage() {
  const images = (await getSite()).gallery;
  return (
    <main>
      <h1 className="mb-6 text-3xl">Gallery</h1>
      <GalleryDesk images={images} />
    </main>
  );
}
