import { PagesDesk } from '@/components/admin/PagesDesk';
import { getSite } from '@/lib/store';

export default async function PagesAdminPage() {
  const banners = (await getSite()).banners;
  return (
    <main>
      <h1 className="text-3xl">Pages</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Open a page to change its banner image, heading, and text.</p>
      <PagesDesk banners={banners} />
    </main>
  );
}
