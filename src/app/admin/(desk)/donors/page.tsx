import { DonorsDesk } from '@/components/admin/DonorsDesk';
import { getSite } from '@/lib/store';

export default function DonorsPage() {
  const donors = getSite().donations.filter((item) => item.status === 'paid');
  return (
    <main>
      <h1 className="text-3xl">Donors</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">People who have given to the foundation, with the details needed for a receipt.</p>
      <DonorsDesk donors={donors} />
    </main>
  );
}
