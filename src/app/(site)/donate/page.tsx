import type { Metadata } from 'next';
import { Gift, Heart, ShieldCheck } from 'lucide-react';
import { DonateForm } from '@/components/DonateForm';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { paymentProvider, paymentReady } from '@/lib/payments';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Navnikunj Foundation with an online donation.',
  alternates: { canonical: '/donate' },
};

function titleWithAccent(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return title;
  const last = words.pop();
  return (
    <>
      {words.join(' ')}{' '}
      <span className="relative inline-block text-brand">
        {last}
        <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-brand" />
      </span>
    </>
  );
}

export default async function DonatePage() {
  const site = await getSite();
  const provider = paymentProvider();
  const checkout = provider === 'cashfree' ? 'Cashfree' : 'Razorpay';
  const points = [
    {
      icon: Gift,
      title: `Payments open in ${checkout} Checkout`,
      text: 'A fast, secure payment page for your donation.',
    },
    {
      icon: ShieldCheck,
      title: 'Your support makes an impact',
      text: provider === 'cashfree'
        ? 'A gift is marked paid only after Cashfree confirms the order.'
        : 'A gift is marked paid only after the payment signature is verified.',
    },
    {
      icon: Heart,
      title: 'Transparency you can trust',
      text: 'The admin desk lists every attempt and every confirmed gift.',
    },
  ];
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'donate')} />
      <div className="shell grid items-start gap-8 pb-section pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:pt-12">
        <div className="max-w-md">
          <h2 className="heading-xl pb-1 text-ink">{titleWithAccent(site.cta.title)}</h2>
          <p className="lead mt-4">{site.cta.text}</p>
          <ul className="mt-6 space-y-4">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.title} className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-brand">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{point.title}</span>
                    <span className="mt-0.5 block text-sm leading-6 text-muted">{point.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 flex items-center gap-2 text-2xl italic text-brand">
            <Heart size={18} className="fill-brand" />
            Together we can do more
          </p>
        </div>
        <DonateForm provider={provider} configured={paymentReady()} />
      </div>
    </main>
  );
}
