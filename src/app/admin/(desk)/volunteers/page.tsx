import { VolunteersDesk } from '@/components/admin/VolunteersDesk';
import { getSite } from '@/lib/store';

export default async function VolunteersPage() {
  const site = await getSite();
  return (
    <main>
      <VolunteersDesk volunteers={site.volunteers} teamPeople={site.teamPeople} />
    </main>
  );
}
