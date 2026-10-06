import { DonationsDesk } from '@/components/admin/DonationsDesk';
import { getSite } from '@/lib/store';

export default async function DonationsPage() {
  const donations = (await getSite()).donations;
  return (
    <main>
      <DonationsDesk donations={donations} />
    </main>
  );
}
