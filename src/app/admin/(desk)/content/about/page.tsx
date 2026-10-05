import { AboutEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default async function AboutContentPage() {
  const about = (await getSite()).about;
  return (
    <main>
      <h1 className="text-3xl">About page</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">The story block on the home page and the about page.</p>
      <AboutEditor about={about} />
    </main>
  );
}
