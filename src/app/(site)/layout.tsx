import { Inter } from 'next/font/google';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getSite } from '@/lib/store';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  return (
    <div className={`${inter.variable} ${inter.className}`}>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded bg-white px-3 py-2">Skip to content</a>
      <SiteHeader identity={site.identity} />
      <div id="content">{children}</div>
      <SiteFooter identity={site.identity} />
    </div>
  );
}
