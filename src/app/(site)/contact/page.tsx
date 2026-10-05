import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { MapEmbed } from '@/components/MapEmbed';
import { PageBanner } from '@/components/PageBanner';
import { bannerFor } from '@/lib/banners';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to Navnikunj Foundation or find the office on the map.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const site = await getSite();
  const { identity } = site;
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'contact')} />
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
          <MapEmbed query={identity.mapQuery || identity.address} latitude={identity.latitude} longitude={identity.longitude} />
        </div>
      </div>
    </main>
  );
}
