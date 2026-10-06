'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AdminNotice, useAdminNotice } from '@/components/admin/AdminNotice';
import { CONTENT_SECTIONS } from '@/lib/admin-content';
import { POST_SECTIONS } from '@/lib/admin-posts';
import { BarChart3, Bell, Calendar, ChevronDown, ChevronRight, ExternalLink, FileImage, FileText, Files, HandCoins, Images, IndianRupee, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Newspaper, PanelLeft, Search, UserRound, Users, X } from 'lucide-react';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/pages', label: 'Pages', icon: Files },
  { href: '/admin/posts', label: 'News & events', icon: Newspaper },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/images', label: 'Images', icon: FileImage },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/donations', label: 'Donations', icon: IndianRupee },
  { href: '/admin/donors', label: 'Donors', icon: HandCoins },
  { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: UserRound },
];

type DeskLink = (typeof LINKS)[number];

function displayName(user: string) {
  const clean = user.trim();
  if (!clean) return 'Admin';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function Submenu({
  sections,
  pathname,
  onNavigate,
}: {
  sections: readonly { href: string; label: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="ml-5 mt-1 space-y-0.5 border-l border-white/15 pl-3">
      {sections.map((section) => {
        const sectionActive = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={sectionActive ? 'page' : undefined}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2 text-sm ${sectionActive ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            {section.label}
          </Link>
        );
      })}
    </div>
  );
}

function NavLinks({ pathname, collapsed, onNavigate, links }: { pathname: string; collapsed: boolean; onNavigate?: () => void; links: DeskLink[] }) {
  const inContent = pathname === '/admin/content' || pathname.startsWith('/admin/content/');
  const inPosts = pathname === '/admin/posts' || pathname.startsWith('/admin/posts/');
  const [contentOpen, setContentOpen] = useState(inContent);
  const [postsOpen, setPostsOpen] = useState(inPosts);

  useEffect(() => {
    if (inContent) setContentOpen(true);
    if (inPosts) setPostsOpen(true);
  }, [inContent, inPosts]);

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Admin">
      {links.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        const sections = item.href === '/admin/content' ? CONTENT_SECTIONS : null;
        const sectionOpen = item.href === '/admin/content' ? contentOpen : postsOpen;
        const inSection = item.href === '/admin/content' ? inContent : inPosts;
        const toggle = item.href === '/admin/content' ? () => setContentOpen((value) => !value) : () => setPostsOpen((value) => !value);
        return (
          <div key={item.href}>
            <div className={`flex items-center rounded-lg text-sm ${active ? 'bg-brand text-white' : inSection ? 'text-white' : 'text-white/80'}`}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
                className={`flex min-w-0 flex-1 items-center rounded-lg py-2.5 ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} ${active ? '' : 'hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
              </Link>
              {!collapsed && sections ? (
                <button
                  type="button"
                  aria-expanded={sectionOpen}
                  aria-label={sectionOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                  onClick={toggle}
                  className="mr-1 rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  {sectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : null}
            </div>
            {!collapsed && sections && sectionOpen ? <Submenu sections={sections} pathname={pathname} onNavigate={onNavigate} /> : null}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ user, role = 'admin', children }: { user: string; role?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeHit, setActiveHit] = useState(0);
  const { notice, show, clear } = useAdminNotice();
  const name = displayName(user);

  useEffect(() => {
    const onShow = (event: Event) => {
      const detail = (event as CustomEvent<{ tone: 'success' | 'error'; message: string }>).detail;
      if (detail?.message) show(detail.tone, detail.message);
    };
    const onClear = () => clear();
    window.addEventListener('admin-notice', onShow);
    window.addEventListener('admin-notice-clear', onClear);
    return () => {
      window.removeEventListener('admin-notice', onShow);
      window.removeEventListener('admin-notice-clear', onClear);
    };
  }, [show, clear]);

  useEffect(() => {
    setNow(new Date());
    setCollapsed(window.localStorage.getItem('navnikunj-admin-sidebar') === 'collapsed');
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const links = role === 'admin' ? LINKS : LINKS.filter((item) => item.href !== '/admin/users');
  const searchItems = useMemo(() => [
    ...links.map((item) => ({ href: item.href, label: item.label, group: 'Desk' })),
    ...CONTENT_SECTIONS.map((section) => ({ href: section.href, label: section.label, group: 'Content' })),
    ...POST_SECTIONS.map((section) => ({ href: section.href, label: section.label, group: 'Posts' })),
  ], [links]);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return searchItems;
    return searchItems.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(needle));
  }, [query, searchItems]);

  const goTo = (href: string) => {
    setSearchOpen(false);
    setQuery('');
    setOpen(false);
    router.push(href);
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const hit = matches[activeHit] || matches[0];
    if (hit) goTo(hit.href);
  };

  const toggleSidebar = () => {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem('navnikunj-admin-sidebar', next ? 'collapsed' : 'open');
      return next;
    });
  };

  const logout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
      <img src="/images/logo.svg" alt="" className="h-9 w-auto rounded-md bg-white object-contain" />
      <span className="text-[15px] font-semibold tracking-tight text-stone-900">Navnikunj</span>
    </Link>
  );

  const actions = (
    <div className="space-y-1 border-t border-white/10 p-3">
      <Link href="/" title={collapsed ? 'View site' : undefined} className={`flex items-center rounded-lg py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}>
        <ExternalLink size={18} strokeWidth={1.75} />
        {collapsed ? <span className="sr-only">View site</span> : 'View site'}
      </Link>
      <button type="button" title={collapsed ? 'Log out' : undefined} onClick={logout} className={`flex w-full items-center rounded-lg py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}>
        <LogOut size={18} strokeWidth={1.75} />
        {collapsed ? <span className="sr-only">Log out</span> : 'Log out'}
      </button>
    </div>
  );

  const iconLink = 'rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800';

  return (
    <div className="min-h-screen bg-stone-100" style={{ '--admin-side': collapsed ? '4.5rem' : '16rem' } as CSSProperties}>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ left: collapsed ? '4.5rem' : '16rem' }}
          className="absolute bottom-0 z-40 hidden h-7 w-7 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full bg-brand text-white shadow-md hover:bg-brandDark lg:grid"
        >
          <PanelLeft size={14} />
        </button>
        <div className="flex h-16 items-center gap-3 px-3 sm:gap-4 sm:px-5">
          <button type="button" className="rounded-lg border border-stone-200 p-2 text-stone-700 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          {brand}
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-stone-900">{now ? `${greetingFor(now)}, ${name}` : name}</p>
            <p className="truncate text-xs text-stone-500">{now ? now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
          </div>
          <form onSubmit={onSearch} className="relative mx-auto hidden min-w-0 max-w-xl flex-1 md:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActiveHit(0); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setActiveHit((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setActiveHit((index) => Math.max(index - 1, 0));
                } else if (event.key === 'Escape') {
                  setSearchOpen(false);
                  searchRef.current?.blur();
                }
              }}
              placeholder="Search pages and content..."
              aria-label="Search admin pages"
              className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-16 text-sm outline-none focus:border-brand focus:bg-white"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-stone-400 sm:inline">Ctrl+K</kbd>
            {searchOpen && matches.length ? (
              <ul className="absolute left-0 right-0 top-12 z-40 max-h-80 overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                {matches.map((item, index) => (
                  <li key={item.href}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => goTo(item.href)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${index === activeHit ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
                    >
                      <span className="font-medium text-stone-800">{item.label}</span>
                      <span className="text-xs text-stone-400">{item.group}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/admin/messages" className={iconLink} aria-label="Messages" title="Messages"><Bell size={18} /></Link>
            <Link href="/admin/posts" className={`hidden sm:inline-flex ${iconLink}`} aria-label="News and events" title="News and events"><Calendar size={18} /></Link>
            <Link href="/admin/messages" className={`hidden sm:inline-flex ${iconLink}`} aria-label="Inbox" title="Inbox"><MessageSquare size={18} /></Link>
            <div className="ml-1 flex items-center gap-2 border-l border-stone-200 pl-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-semibold text-white" aria-hidden>{initials(name)}</span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-semibold text-stone-900">{name}</span>
                <span className="block text-xs text-stone-500">Administrator</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`relative sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col bg-[#16100e] transition-[width] duration-200 lg:flex ${collapsed ? 'w-[4.5rem]' : 'w-64'}`}>
          <NavLinks pathname={pathname} collapsed={collapsed} links={links} />
          {actions}
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setOpen(false)} />
            <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#16100e]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                  <img src="/images/logo.svg" alt="" className="h-10 w-auto rounded-lg bg-white object-contain px-1.5 py-1" />
                  <span className="text-sm font-semibold text-white">Admin</span>
                </Link>
                <button type="button" className="rounded-md p-2 text-white" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <NavLinks pathname={pathname} collapsed={false} onNavigate={() => setOpen(false)} links={links} />
              <div className="space-y-1 border-t border-white/10 p-3">
                <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white">
                  <ExternalLink size={18} strokeWidth={1.75} />
                  View site
                </Link>
                <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white">
                  <LogOut size={18} strokeWidth={1.75} />
                  Log out
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <AdminNotice notice={notice} onClose={clear} shiftClass={collapsed ? 'top-20 lg:left-[4.5rem]' : 'top-20 lg:left-64'} />
          <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
