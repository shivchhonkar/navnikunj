import { ProgramsEditor } from '@/components/admin/ContentDesk';
import { getSite } from '@/lib/store';

export default async function ProgramsContentPage() {
  const programs = (await getSite()).programs;
  return (
    <main>
      <h1 className="text-3xl">Programs</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">Focus areas shown on the home page and the programs list.</p>
      <ProgramsEditor programs={programs} />
    </main>
  );
}