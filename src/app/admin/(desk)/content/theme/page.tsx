import { ThemeEditor } from '@/components/admin/ThemeDesk';
import { getSite } from '@/lib/store';

export default async function ThemeContentPage() {
  const theme = (await getSite()).theme;
  return (
    <main>
      <h1 className="text-3xl">Theme</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">These colours apply across the public site: buttons, the header and footer, the page background, and the hero banner washes.</p>
      <ThemeEditor theme={theme} />
    </main>
  );
}
