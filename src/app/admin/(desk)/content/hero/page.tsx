import { HeroEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default function HeroContentPage() {
  return (
    <main>
      <h1 className="text-3xl">Home hero banner</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">The opening headline and photograph on the home page.</p>
      <HeroEditor hero={getSite().hero} />
    </main>
  );
}
