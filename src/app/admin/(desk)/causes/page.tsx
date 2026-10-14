import { CausesDesk } from '@/components/admin/CausesDesk';
import { getSite } from '@/lib/store';

export default async function CausesAdminPage() {
  const causes = (await getSite()).causes;
  return (
    <main>
      <h1 className="text-3xl">Causes</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-stone-600">
        These are the campaigns on the public donate page. Edit the story, photo, progress, and the products a visitor can add before they pay.
      </p>
      <CausesDesk causes={causes} />
    </main>
  );
}
