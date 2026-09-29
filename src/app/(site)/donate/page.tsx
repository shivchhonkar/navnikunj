import type { Metadata } from 'next';
import { DonateForm } from '@/components/DonateForm';
import { getSite, razorpayReady } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Navnikunj Foundation with an online donation through Razorpay.',
  alternates: { canonical: '/donate' },
};

export default function DonatePage() {
  const site = getSite();
  return (
    <main className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-12 md:py-16 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Donate</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">{site.cta.title}</h1>
        <p className="mt-4 max-w-xl leading-7 text-stone-700">{site.cta.text}</p>
        <ul className="mt-6 space-y-2 text-sm text-stone-600">
          <li>Payments open in Razorpay Checkout.</li>
          <li>A gift is marked paid only after the payment signature is verified.</li>
          <li>The admin desk lists every attempt and every confirmed gift.</li>
        </ul>
      </div>
      <DonateForm configured={razorpayReady()} />
    </main>
  );
}
