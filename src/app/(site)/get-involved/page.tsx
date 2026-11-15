import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HandHeart, Megaphone, Users } from 'lucide-react';
import { GetInvolvedPanel } from '@/components/GetInvolvedPanel';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { PEOPLE_ROLES } from '@/lib/people';
import { getSite } from '@/lib/store';
import type { LucideIcon } from 'lucide-react';
import type { VolunteerRole } from '@/lib/types';

const ICONS: Record<VolunteerRole, LucideIcon> = {
  volunteer: Users,
  support: HandHeart,
  fundraiser: Megaphone,
};

export const metadata: Metadata = {
  title: 'Get involved',
  description: 'Volunteer, join the support team, or raise funds with Navnikunj Foundation.',
  alternates: { canonical: '/get-involved' },
};

export default async function GetInvolvedPage() {
  const site = await getSite();
  const shown = site.volunteers.filter((person) => person.featured && person.status === 'active');

  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'get-involved')} />
      <section className="section shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Take part</p>
          <h2 className="heading-lg mt-3 text-ink">Choose how you want to stand with the work</h2>
          <p className="lead mt-4">Some people give a Saturday. Some keep the schedule moving. Some raise funds among people they already know. All three keep the programs going.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PEOPLE_ROLES.map((role) => {
            const Icon = ICONS[role.value];
            return (
              <a key={role.value} href={`#${role.anchor}`} className="card border border-line p-5 transition hover:border-brand">
                <Icon className="text-brand" size={22} aria-hidden />
                <h3 className="mt-3 text-lg text-ink">{role.heading}</h3>
                <p className="lead mt-2 text-sm">{role.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand">Offer your time <ArrowRight size={14} /></span>
              </a>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          An organisation can <Link href="/collaborate" className="text-brand hover:text-brandDark">collaborate</Link> instead.
          Stories from people we work with live on the <Link href="/testimonials" className="text-brand hover:text-brandDark">testimonials</Link> page.
        </p>
      </section>

      <GetInvolvedPanel
        people={shown.map((person) => ({
          id: person.id,
          name: person.name,
          city: person.city,
          skills: person.skills,
          role: person.role,
        }))}
      />
    </main>
  );
}
