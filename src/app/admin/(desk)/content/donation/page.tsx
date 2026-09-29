import { DonationEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default function DonationContentPage() {
  return (
    <main>
      <h1 className="text-3xl">Donation banner</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">The appeal shown with the donate button on the home page.</p>
      <DonationEditor cta={getSite().cta} />
    </main>
  );
}
