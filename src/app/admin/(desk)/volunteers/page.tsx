import { VolunteersDesk } from '@/components/admin/VolunteersDesk';
import { getSite } from '@/lib/store';

export default async function VolunteersPage() {
  const volunteers = (await getSite()).volunteers;
  return (
    <main>
      <VolunteersDesk volunteers={volunteers} />
    </main>
  );
}
