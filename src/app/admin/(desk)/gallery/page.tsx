import { GalleryDesk } from '@/components/admin/GalleryDesk';
import { getSite } from '@/lib/store';

export default function GalleryAdminPage() {
  return (
    <main>
      <h1 className="mb-6 text-3xl">Gallery</h1>
      <GalleryDesk images={getSite().gallery} />
    </main>
  );
}
