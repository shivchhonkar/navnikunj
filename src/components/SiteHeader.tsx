'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, Facebook, Instagram, Linkedin, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import type { SiteData } from '@/lib/types';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us', children: [{ href: '/team', label: 'Our Team' }] },
  { href: '/programs', label: 'Programs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News & Updates' },
  { href: '/contact', label: 'Contact' },
];

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

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

  const linkTone = 'text-ink hover:text-brand';

  return (
    <header className={`sticky top-0 z-40 border-b border-line bg-white text-ink transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
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
            {identity.email && <a className={`hidden items-center gap-1.5 lg:inline-flex ${linkTone}`} href={`mailto:${identity.email}`}><Mail size={15} /> {identity.email}</a>}
            {/* {identity.phoneHref && <a className={`inline-flex items-center gap-1.5 ${linkTone}`} href={`tel:${identity.phoneHref}`}><Phone size={15} /> <span className="hidden sm:inline">{identity.phone}</span></a>} */}
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
        <Link href="/" className="inline-flex shrink-0 items-center" aria-label={identity.name}>
          <img src="/images/LOGO_NT.svg" alt={identity.name} className="h-12 w-auto object-contain" />
        </Link>
        <div className="ml-auto hidden items-center gap-10 lg:flex">
          <nav className="flex items-center gap-7 text-[15px]" aria-label="Primary">
            {NAV.map((item) => {
              const active = isCurrent(pathname, item.href) || item.children?.some((child) => isCurrent(pathname, child.href));
              const mark = `relative inline-flex items-center gap-1 py-1 ${linkTone} ${active ? 'after:absolute after:-bottom-1.5 after:left-1/2 after:h-0.5 after:w-7 after:-translate-x-1/2 after:rounded-full after:bg-[#e07a2f]' : ''}`;
              if (!item.children?.length) {
                return <Link key={item.href} href={item.href} className={mark}>{item.label}</Link>;
              }
              return (
                <div key={item.href} className="group relative">
                  <Link href={item.href} className={mark} aria-haspopup="true">
                    {item.label}
                    <ChevronDown size={14} className="text-stone-400 transition group-hover:text-brand" aria-hidden />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="-ml-3 min-w-[9.5rem] overflow-hidden rounded-lg border border-line bg-white py-1 shadow-md">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} className={`block whitespace-nowrap px-3 py-2 text-[15px] leading-6 ${isCurrent(pathname, child.href) ? 'bg-sand text-brand' : 'text-ink hover:bg-sand hover:text-brand'}`}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
          <Link href="/donate" className="btn btn-brand shrink-0 px-5 py-2.5 text-sm">Donate Now</Link>
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link href="/donate" className="btn btn-brand px-4 py-2.5 text-sm">Donate</Link>
          <button type="button" className="inline-flex rounded-md border border-line p-2 text-ink" aria-label="Open menu" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="space-y-1 border-t border-line px-page py-3 lg:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <div key={item.href}>
              <Link href={item.href} className="block rounded-md px-2 py-2.5 text-sm text-ink hover:bg-sand" onClick={() => setOpen(false)}>{item.label}</Link>
              {item.children?.map((child) => (
                <Link key={child.href} href={child.href} className="block rounded-md py-2 pl-6 pr-2 text-sm text-stone-600 hover:bg-sand hover:text-ink" onClick={() => setOpen(false)}>{child.label}</Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
