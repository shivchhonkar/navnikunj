import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import { getSite, siteUrl } from '@/lib/store';
import './globals.css';

const sans = Source_Sans_3({ subsets: ['latin'], variable: '--font-sans' });

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const site = getSite();
  const url = siteUrl();
  return {
    metadataBase: new URL(url),
    title: {
      default: `${site.identity.name} · ${site.identity.tagline}`,
      template: `%s · ${site.identity.name}`,
    },
    description: site.hero.text,
    openGraph: {
      type: 'website',
      url,
      title: site.identity.name,
      description: site.hero.text,
      images: ['/logo.png'],
      siteName: site.identity.name,
    },
    twitter: { card: 'summary_large_image', title: site.identity.name, description: site.hero.text, images: ['/logo.jpg'] },
    icons: { icon: '/images/logo.svg' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: site.identity.name,
    slogan: site.identity.tagline,
    url: siteUrl(),
    email: site.identity.email,
    telephone: site.identity.phone,
    address: site.identity.address,
    logo: `${siteUrl()}/images/logo.svg`,
  };
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
