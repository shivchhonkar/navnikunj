export type ProgramIcon = 'book' | 'health' | 'users' | 'sprout' | 'heart';
export type PostKind = 'blog' | 'news' | 'event';

export type Program = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: ProgramIcon;
};

export type Post = {
  id: string;
  slug: string;
  kind: PostKind;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  date: string;
  location: string;
  keywords: string;
  published: boolean;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  at: string;
};

export type Donation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  address: string;
  country: string;
  amount: number;
  orderId: string;
  paymentId: string;
  status: 'created' | 'paid' | 'failed';
  at: string;
};

export type SiteData = {
  adminUser: string;
  passwordHash: string;
  identity: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    phoneHref: string;
    phone2: string;
    phoneHref2: string;
    address: string;
    mapQuery: string;
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  hero: { eyebrow: string; title: string; text: string; image: string };
  stats: { value: string; label: string }[];
  about: { eyebrow: string; title: string; text: string; quote: string; image: string };
  cta: { title: string; text: string };
  programs: Program[];
  posts: Post[];
  gallery: GalleryImage[];
  messages: ContactMessage[];
  donations: Donation[];
};
