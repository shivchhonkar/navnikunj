import { NumbersEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default async function NumbersContentPage() {
  const stats = (await getSite()).stats;
  return (
    <main>
      <h1 className="text-3xl">Impact numbers</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">The figures in the stats bar on the home page. Up to six.</p>
      <NumbersEditor stats={stats} />
    </main>
  );
}
