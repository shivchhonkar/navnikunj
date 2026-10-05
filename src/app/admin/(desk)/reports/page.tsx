import { ReportsDesk } from '@/components/admin/ReportsDesk';
import { getSite } from '@/lib/store';

export default async function ReportsPage() {
  const reports = (await getSite()).reports;
  return (
    <main>
      <h1 className="text-3xl">Reports</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Save a snapshot of donations, donors, volunteers, or events. Leave the dates empty to include every record.</p>
      <ReportsDesk reports={reports} />
    </main>
  );
}
