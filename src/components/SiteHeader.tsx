'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import type { SiteData } from '@/lib/types';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/work', label: 'Our Work' },
  { href: '/programs', label: 'Programs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News & Updates' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ identity }: { identity: SiteData['identity'] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const social = [
    { href: identity.facebook, label: 'Facebook', icon: Facebook },
    { href: identity.youtube, label: 'YouTube', icon: Youtube },
    { href: identity.linkedin, label: 'LinkedIn', icon: Linkedin },
    { href: identity.instagram, label: 'Instagram', icon: Instagram },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkTone = scrolled ? 'hover:text-white/80' : 'text-ink hover:text-brand';

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${scrolled ? 'site-chrome border-white/10' : 'border-line bg-white text-ink'}`}>
      <div className={`overflow-hidden border-b text-sm transition-all duration-200 ${scrolled ? 'h-0 border-transparent' : 'h-10 border-line'}`}>
        <div className="shell flex h-10 items-center justify-between gap-4">
        {/* <p className="flex min-w-0 items-center gap-2 truncate">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{identity.address}</span>
          </p> */}
          <p className="flex min-w-0 items-center gap-2 truncate">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{identity.name.toUpperCase()}</span>
          </p>
          {/* <p className="min-w-0 truncate">{identity.name.toUpperCase()}</p> */}
          <div className="flex shrink-0 items-center gap-5">
            <a className={`hidden items-center gap-1.5 lg:inline-flex ${linkTone}`} href={`mailto:${identity.email}`}><Mail size={15} /> {identity.email}</a>
            <a className={`inline-flex items-center gap-1.5 ${linkTone}`} href={`tel:${identity.phoneHref}`}><Phone size={15} /> <span className="hidden sm:inline">{identity.phone}</span></a>
            <span className="hidden items-center gap-3 sm:inline-flex">
              {social.map((item) => {
                const Icon = item.icon;
                return item.href
                  ? <a key={item.label} href={item.href} aria-label={item.label} className={`inline-flex ${linkTone}`}><Icon size={15} /></a>
                  : <Icon key={item.label} size={15} aria-hidden />;
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="shell flex h-[4.5rem] items-center gap-8">
        <Link href="/" className={`inline-flex shrink-0 items-center ${scrolled ? 'rounded-md bg-white px-2 py-1.5' : ''}`} aria-label={identity.name}>
          <img src="/images/logo.svg" alt={identity.name} className={`w-auto object-contain ${scrolled ? 'h-9' : 'h-12'}`} />
        </Link>
        <div className="ml-auto hidden items-center gap-10 lg:flex">
          <nav className="flex items-center gap-7 text-[15px]" aria-label="Primary">
            {NAV.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={`relative inline-flex items-center py-1 ${linkTone} ${active ? 'after:absolute after:-bottom-1.5 after:left-1/2 after:h-0.5 after:w-7 after:-translate-x-1/2 after:rounded-full after:bg-[#e07a2f]' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/donate" className="btn btn-brand shrink-0 px-5 py-2.5 text-sm">Donate Now</Link>
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link href="/donate" className="btn btn-brand px-4 py-2.5 text-sm">Donate</Link>
          <button type="button" className={`inline-flex rounded-md border p-2 ${scrolled ? 'border-white/30' : 'border-line text-ink'}`} aria-label="Open menu" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className={`space-y-1 border-t px-page py-3 lg:hidden ${scrolled ? 'border-white/10' : 'border-line'}`} aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded-md px-2 py-2.5 text-sm ${scrolled ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-sand'}`} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
