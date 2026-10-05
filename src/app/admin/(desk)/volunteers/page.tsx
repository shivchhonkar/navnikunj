import { VolunteersDesk } from '@/components/admin/VolunteersDesk';
import { getSite } from '@/lib/store';

export default async function VolunteersPage() {
  const volunteers = (await getSite()).volunteers;
  return (
    <main>
      <h1 className="text-3xl">Volunteers</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">People who have offered time, and whether they are active.</p>
      <VolunteersDesk volunteers={volunteers} />
    </main>
  );
}
