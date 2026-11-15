import type { Metadata } from 'next';
import Link from 'next/link';
import { PageBanner } from '@/components/PageBanner';
import { TestimonialCard } from '@/components/TestimonialCard';
import { bannerFor } from '@/lib/banners';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Notes from people who have volunteered, given, or been supported by Navnikunj Foundation.',
  alternates: { canonical: '/testimonials' },
};

export default async function TestimonialsPage() {
  const site = await getSite();
  const quotes = site.testimonials.filter((item) => item.published);

  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'testimonials')} />
      <section className="section shell">
        {quotes.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quotes.map((item) => <TestimonialCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="mx-auto max-w-xl text-center">
            <h2 className="heading-lg text-ink">Stories will be shared here</h2>
            <p className="lead mt-4">Notes from volunteers, donors, partners, and people the programs have reached will appear on this page once the team publishes them.</p>
            <Link href="/get-involved" className="btn btn-brand mt-8">Get involved</Link>
          </div>
        )}
      </section>
    </main>
  );
}
