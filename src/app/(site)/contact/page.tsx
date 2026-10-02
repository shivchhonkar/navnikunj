import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { MapEmbed } from '@/components/MapEmbed';
import { getSite } from '@/lib/store';

const BANNER_PHOTO = 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to Navnikunj Foundation or find the office on the map.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const { identity } = getSite();
  return (
    <main>
      <section className="relative isolate overflow-hidden text-white">
        <img src={BANNER_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/15 via-ink/45 to-ink/75" />
        <div className="shell relative flex min-h-[13rem] items-center py-12 md:min-h-[17rem] md:justify-end">
          <div className="max-w-lg md:text-right">
            <h1 className="heading-xl">Contact</h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">Write to the team, or find us on the map</p>
          </div>
        </div>
      </section>
      <div className="section shell grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <ContactForm />
        </div>
        <div className="space-y-4">
          <ul className="space-y-3 rounded-2xl bg-white p-5 text-sm shadow-card">
            <li className="flex gap-2"><MapPin className="mt-0.5 shrink-0 text-brand" size={16} /> <span className="whitespace-pre-line">{identity.address}</span></li>
            <li><a className="inline-flex items-center gap-2" href={`mailto:${identity.email}`}><Mail className="text-brand" size={16} /> {identity.email}</a></li>
            <li><a className="inline-flex items-center gap-2" href={`tel:${identity.phoneHref}`}><Phone className="text-brand" size={16} /> {identity.phone}</a></li>
            {identity.phone2 ? <li><a className="inline-flex items-center gap-2" href={`tel:${identity.phoneHref2}`}><Phone className="text-brand" size={16} /> {identity.phone2}</a></li> : null}
          </ul>
          <MapEmbed query={identity.mapQuery || identity.address} />
        </div>
      </div>
    </main>
  );
}
