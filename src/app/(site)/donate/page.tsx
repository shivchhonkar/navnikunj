import type { Metadata } from 'next';
import { DonateForm } from '@/components/DonateForm';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { getSite, razorpayReady } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Navnikunj Foundation with an online donation through Razorpay.',
  alternates: { canonical: '/donate' },
};

export default async function DonatePage() {
  const site = await getSite();
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'donate')} />
      <div className="section shell grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <h2 className="text-4xl sm:text-5xl">{site.cta.title}</h2>
        <p className="mt-4 max-w-xl leading-7 text-stone-700">{site.cta.text}</p>
        <ul className="mt-6 space-y-2 text-sm text-stone-600">
          <li>Payments open in Razorpay Checkout.</li>
          <li>A gift is marked paid only after the payment signature is verified.</li>
          <li>The admin desk lists every attempt and every confirmed gift.</li>
        </ul>
      </div>
      <DonateForm configured={razorpayReady()} />
      </div>
    </main>
  );
}
