import { TestimonialsDesk } from '@/components/admin/TestimonialsDesk';
import { getSite } from '@/lib/store';

export default async function TestimonialsAdminPage() {
  const site = await getSite();
  return (
    <main>
      <TestimonialsDesk testimonials={site.testimonials} home={site.home} />
    </main>
  );
}
