import { DonationsDesk } from '@/components/admin/DonationsDesk';
import { getSite } from '@/lib/store';

export default function DonationsPage() {
  return (
    <main>
      <h1 className="text-3xl">Donations</h1>
      <div className="mt-6">
        <DonationsDesk donations={getSite().donations} />
      </div>
    </main>
  );
}
