import type { Metadata } from 'next';
import { Building2, GraduationCap, Handshake, Package } from 'lucide-react';
import { CollaborateForm } from '@/components/CollaborateForm';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { getSite } from '@/lib/store';

const WAYS = [
  { title: 'Schools and colleges', text: 'Student visits, awareness drives, and projects that sit beside a program already running.', icon: GraduationCap },
  { title: 'Companies and CSR', text: 'A funded drive, employee volunteering, or a skill your workplace can lend for a season.', icon: Building2 },
  { title: 'Other organisations', text: 'Share a camp, a route, or a community so two teams are not doing the same work apart.', icon: Handshake },
  { title: 'In-kind support', text: 'Books, meals, medical supplies, transport, or a room for a gathering.', icon: Package },
];

export const metadata: Metadata = {
  title: 'Collaborate',
  description: 'Partner with Navnikunj Foundation as a school, company, organisation, or in-kind supporter.',
  alternates: { canonical: '/collaborate' },
};

export default async function CollaboratePage() {
  const site = await getSite();
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'collaborate')} />
      <section className="section shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Partnerships</p>
          <h2 className="heading-lg mt-3 text-ink">Work alongside the foundation</h2>
          <p className="lead mt-4">Collaboration is for groups: a school, a company, another organisation, or someone who can offer materials instead of time. Individuals who want to volunteer, support the team, or raise funds can do that on the get involved page.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {WAYS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="card border border-line p-5">
                <Icon className="text-brand" size={22} aria-hidden />
                <h3 className="mt-3 text-lg text-ink">{item.title}</h3>
                <p className="lead mt-2 text-sm">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="section bg-paper">
        <div className="shell grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="heading-lg text-ink">Send a note</h2>
            <p className="lead mt-4">Say who you are and what you would like to do together. The team reads every note and replies by email.</p>
            <p className="mt-4 text-sm leading-6 text-muted">If you are writing as one person, rather than for an organisation, the volunteer, support team, and fund raiser forms are the better place to start.</p>
          </div>
          <div className="rounded-card bg-white p-5 shadow-card sm:p-6">
            <CollaborateForm />
          </div>
        </div>
      </section>
    </main>
  );
}
