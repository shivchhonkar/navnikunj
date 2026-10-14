import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CauseKart } from '@/components/CauseKart';
import { paymentProvider, paymentReady } from '@/lib/payments';
import { getSite } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await getSite();
  const cause = site.causes.find((item) => item.slug === params.slug && item.published);
  if (!cause) return { title: 'Cause' };
  return {
    title: cause.title,
    description: cause.summary,
    alternates: { canonical: `/donatekart/${cause.slug}` },
  };
}

export default async function CausePage({ params }: PageProps) {
  const site = await getSite();
  const cause = site.causes.find((item) => item.slug === params.slug && item.published);
  if (!cause) notFound();
  const recent = site.donations.find((item) => item.status === 'paid' && item.causeSlug === cause.slug) || null;

  return (
    <main>
      <div className="shell pb-4 pt-4 md:pb-5 md:pt-6">
        <Link href="/donatekart" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark"><ArrowLeft size={16} /> Back to All Causes</Link>
      </div>
      <CauseKart
        cause={cause}
        recent={recent ? { name: recent.name, amount: recent.amount, at: recent.at } : null}
        provider={paymentProvider()}
        configured={paymentReady()}
      />
    </main>
  );
}
