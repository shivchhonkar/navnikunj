import { DonorsDesk } from '@/components/admin/DonorsDesk';
import { getSite } from '@/lib/store';

export default async function DonorsPage() {
  const donors = (await getSite()).donations.filter((item) => item.status === 'paid');
  return (
    <main className="-mt-4">
      <DonorsDesk donors={donors} />
    </main>
  );
}
