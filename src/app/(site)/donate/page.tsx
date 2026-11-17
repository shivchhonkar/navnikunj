import type { Metadata } from 'next';
import { Gift, Heart, Receipt, ShieldCheck } from 'lucide-react';
import { DonateForm } from '@/components/DonateForm';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { paymentProvider, paymentReady } from '@/lib/payments';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Navnikunj Foundation with an online donation. Tax-saving registration details are listed on this page.',
  alternates: { canonical: '/donate' },
};

const TAX_REGISTRATION = {
  label: 'NAVNIKUNJ FOUNDATION – UNIQUE REGISTRATION NUMBER',
  number: 'AAMCN1441KF20261',
  reference: 'Registration reference provided',
  section: 'Section 354(4) – Income-tax Act, 2025',
  note: 'Corresponding to the earlier Section 80G framework.',
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
    {
      icon: Receipt,
      title: 'Tax-saving registration',
      text: 'Eligible gifts may qualify for a deduction under the Income-tax Act. Keep your receipt and the registration number below when you file.',
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
          <aside className="mt-8 rounded-card border border-line bg-sand/70 p-5" aria-label="Tax-saving registration">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand">{TAX_REGISTRATION.label}</p>
            <p className="mt-3 font-mono text-xl tracking-wide text-ink sm:text-2xl">{TAX_REGISTRATION.number}</p>
            <p className="mt-2 text-sm text-muted">{TAX_REGISTRATION.reference}</p>
            <p className="mt-1 text-sm font-medium text-ink">{TAX_REGISTRATION.section}</p>
            <p className="mt-1 text-sm text-muted">{TAX_REGISTRATION.note}</p>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm leading-6 text-muted">
              <p>A donation receipt that carries this unique registration number can help you claim a deduction when you file your income-tax return, under the rules that apply to you.</p>
              <p>Save the payment confirmation from this page and quote <span className="font-medium text-ink">{TAX_REGISTRATION.number}</span> if your tax software or adviser asks for the NGO registration details.</p>
              {/* <p>How much you can claim depends on your income and the current law. This page shares the foundation’s registration for your records; it is not personal tax advice.</p> */}
            </div>
          </aside>
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
