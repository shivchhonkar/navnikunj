import { ContactEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default async function ContactContentPage() {
  const identity = (await getSite()).identity;
  return (
    <main>
      <h1 className="text-3xl">Contact details</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Shown in the header, footer, and on the contact page. The map pin uses latitude and longitude.</p>
      <ContactEditor identity={identity} />
    </main>
  );
}
