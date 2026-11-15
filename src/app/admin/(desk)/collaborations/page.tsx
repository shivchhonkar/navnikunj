import { CollaborationsDesk } from '@/components/admin/CollaborationsDesk';
import { getSite } from '@/lib/store';

export default async function CollaborationsAdminPage() {
  const collaborations = (await getSite()).collaborations;
  return (
    <main>
      <CollaborationsDesk collaborations={collaborations} />
    </main>
  );
}
