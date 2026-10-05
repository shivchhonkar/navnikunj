import { ImagesDesk } from '@/components/admin/ImagesDesk';
import { getSite } from '@/lib/store';

export default async function ImagesPage() {
  const images = (await getSite()).images;
  return (
    <main>
      <h1 className="text-3xl">Images</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Filename, address, alt text, size, type, and the page or record each picture belongs to.</p>
      <ImagesDesk images={images} />
    </main>
  );
}
