import type { MetadataRoute } from 'next';
import { getSite, siteUrl } from '@/lib/store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const root = siteUrl();
  const staticPaths = ['', '/about', '/team', '/work', '/programs', '/gallery', '/news', '/contact', '/donate'];
  const pages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${root}${path || '/'}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
  for (const program of site.programs) {
    pages.push({ url: `${root}/programs/${program.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  }
  for (const post of site.posts.filter((item) => item.published)) {
    pages.push({ url: `${root}/news/${post.slug}`, changeFrequency: 'weekly', priority: 0.6 });
  }
  return pages;
}
