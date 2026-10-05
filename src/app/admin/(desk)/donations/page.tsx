import { DonationsDesk } from '@/components/admin/DonationsDesk';
import { getSite } from '@/lib/store';

export default async function DonationsPage() {
  const donations = (await getSite()).donations;
  return (
    <main>
      <h1 className="text-3xl">Donations</h1>
      <div className="mt-6">
        <DonationsDesk donations={donations} />
      </div>
    </main>
  );
}
