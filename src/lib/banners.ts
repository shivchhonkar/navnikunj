export type PageBanner = {
  slug: string;
  title: string;
  text: string;
  image: string;
};

type BannerDefault = PageBanner & { label: string; position: string };

export const PAGE_BANNERS: BannerDefault[] = [
  {
    slug: 'contact',
    label: 'Contact',
    title: 'Contact',
    text: 'Write to the team, or find us on the map',
    image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=80',
    position: 'object-cover',
  },
  {
    slug: 'about',
    label: 'About',
    title: 'About Us',
    text: 'Together, we can make a difference.',
    image: '/images/banner_images/banner-poor-childrens.jpeg',
    position: 'object-cover object-left',
  },
  {
    slug: 'programs',
    label: 'Programs',
    title: 'Programs',
    text: 'Choose a program to read what it covers and how to support it.',
    image: '/images/banner_images/banner-education.jpeg',
    position: 'object-cover',
  },
  {
    slug: 'gallery',
    label: 'Gallery',
    title: 'Gallery',
    text: 'Photographs from programs, visits, and community work',
    image: '/images/banner_images/banner-poor-childrens.jpeg',
    position: 'object-cover object-[center_40%]',
  },
  {
    slug: 'news',
    label: 'News & blogs',
    title: 'News & Updates',
    text: 'Stories, notes, and upcoming gatherings',
    image: '/images/banner_images/banner-poor-childrens.jpeg',
    position: 'object-cover object-[center_30%]',
  },
  {
    slug: 'team',
    label: 'Our team',
    title: 'People Behind a Brighter Tomorrow',
    text: 'Our team is driven by a shared purpose — to create lasting change in the lives of children and communities.',
    image: '/images/banner_images/banner-smile-face.jpeg',
    position: 'object-cover',
  },
  {
    slug: 'work',
    label: 'Our work',
    title: 'Our Work',
    text: 'Help that is specific, recorded, and close to home',
    image: '/images/banner_images/s-banner-health-check.jpeg',
    position: 'object-cover',
  },
  {
    slug: 'donate',
    label: 'Donate',
    title: 'Donate',
    text: 'Support Navnikunj Foundation with an online donation.',
    image: '/images/banner_images/banner-smile-face.jpeg',
    position: 'object-cover',
  },
];

export function defaultBanners(): PageBanner[] {
  return PAGE_BANNERS.map(({ slug, title, text, image }) => ({ slug, title, text, image }));
}

export function bannerLabel(slug: string) {
  return PAGE_BANNERS.find((item) => item.slug === slug)?.label || slug;
}

export function bannerPosition(slug: string) {
  return PAGE_BANNERS.find((item) => item.slug === slug)?.position || 'object-cover';
}

function filled(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function withBanners(value: unknown): PageBanner[] {
  const rows = Array.isArray(value) ? value : [];
  const saved = new Map(rows.filter((item) => item && typeof item === 'object').map((item) => [String(item.slug || ''), item]));
  return defaultBanners().map((item) => {
    const row = saved.get(item.slug) as Partial<PageBanner> | undefined;
    return {
      slug: item.slug,
      title: filled(row?.title, item.title),
      text: typeof row?.text === 'string' ? row.text.trim() : item.text,
      image: filled(row?.image, item.image),
    };
  });
}

export function bannerFor(banners: PageBanner[], slug: string) {
  return banners.find((item) => item.slug === slug) || defaultBanners().find((item) => item.slug === slug) || defaultBanners()[0];
}
