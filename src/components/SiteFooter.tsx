import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import type { SiteData } from '@/lib/types';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/work', label: 'Our Work' },
  { href: '/programs', label: 'Programs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News & Updates' },
  { href: '/contact', label: 'Contact' },
  { href: '/donate', label: 'Donate' },
];

export function SiteFooter({ identity }: { identity: SiteData['identity'] }) {
  const social = [
    { href: identity.facebook, label: 'Facebook', icon: Facebook },
    { href: identity.instagram, label: 'Instagram', icon: Instagram },
    { href: identity.youtube, label: 'YouTube', icon: Youtube },
    { href: identity.linkedin, label: 'LinkedIn', icon: Linkedin },
  ];
  return (
    <footer className="site-chrome">
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/images/logo.svg" alt="" className="h-24 w-auto rounded-xl bg-white object-contain p-2" />
          <p className="mt-4 text-sm leading-6 text-white/80">{identity.tagline}</p>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wide text-white">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-white/90">
            {LINKS.map((item) => (
              <li key={item.href}><Link className="hover:text-white" href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wide text-white">Contact</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-white/90">
            <li className="flex gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> <span className="whitespace-pre-line">{identity.address}</span></li>
            <li><a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${identity.email}`}><Mail size={15} /> {identity.email}</a></li>
            <li><a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${identity.phoneHref}`}><Phone size={15} /> {identity.phone}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wide text-white">Follow</h2>
          <div className="mt-4 flex gap-3">
            {social.map((item) => {
              const Icon = item.icon;
              const className = 'inline-flex rounded-full border border-white/40 p-2.5 text-white hover:bg-white/10';
              return item.href
                ? <a key={item.label} href={item.href} aria-label={item.label} className={className} target="_blank" rel="noreferrer"><Icon size={16} /></a>
                : <span key={item.label} aria-label={item.label} className={className}><Icon size={16} /></span>;
            })}
          </div>
          <Link href="/donate" className="btn btn-light mt-6 text-sm">Donate Now</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="shell py-4 text-xs text-white/70">© {new Date().getFullYear()} {identity.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
