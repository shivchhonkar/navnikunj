import { HeroEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default async function HeroContentPage() {
  const hero = (await getSite()).hero;
  return (
    <main>
      <h1 className="text-3xl">Home hero banner</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Add one or more slides. Slides can share a headline. Priority 1 appears first, and two or more slides play as a slider.</p>
      <HeroEditor hero={hero} />
    </main>
  );
}
