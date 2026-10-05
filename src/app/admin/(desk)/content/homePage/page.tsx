import { HomePageDesk } from '@/components/admin/HomePageDesk';
import { getSite } from '@/lib/store';

export default async function HomePageContent() {
  const site = await getSite();
  return (
    <main>
      <h1 className="text-3xl">Home page</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Open a section to edit its copy and pictures. Use Shown or Hidden to control what appears on the public home page.</p>
      <HomePageDesk home={site.home} stats={site.stats} cta={site.cta} programs={site.programs} />
    </main>
  );
}
