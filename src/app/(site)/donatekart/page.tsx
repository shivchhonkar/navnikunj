import type { Metadata } from 'next';
import { CauseList } from '@/components/CauseList';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Donate for a cause',
  description: 'Choose a Navnikunj Foundation cause and give online.',
  alternates: { canonical: '/donatekart' },
};

export default async function DonateKartPage() {
  const site = await getSite();
  const causes = site.causes.filter((cause) => cause.published);

  return (
    <main className="section shell">
      <div className="max-w-2xl">
        <p className="eyebrow">Give</p>
        <h1 className="heading-lg mt-3 text-ink">{site.cta.title}</h1>
        <p className="lead mt-4">Choose a cause. You can give money, or add the kits that cause still needs, and pay on this page.</p>
      </div>
      <CauseList causes={causes} />
    </main>
  );
}
