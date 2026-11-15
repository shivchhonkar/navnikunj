export type SiteTheme = {
  brand: string;
  brandDark: string;
  chrome: string;
  background: string;
  heroLight: string;
  heroDark: string;
};

export type TeamPeopleCopy = {
  visible: boolean;
  eyebrow: string;
  heading: string;
  subheading: string;
};

export type TakePartKey = 'volunteer' | 'support' | 'fundraiser' | 'collaborate';

export type TakePartCard = {
  key: TakePartKey;
  title: string;
  text: string;
};

export type HomePageSettings = {
  stats: { visible: boolean; image: string; color: string };
  work: { visible: boolean; eyebrow: string; title: string; text: string; linkLabel: string; cardLabel: string };
  about: { visible: boolean; eyebrow: string; title: string; text: string; detail: string; quote: string; image: string; linkLabel: string };
  takePart: { visible: boolean; eyebrow: string; title: string; text: string; cards: TakePartCard[] };
  donation: { visible: boolean; image: string; buttonLabel: string };
  news: { visible: boolean; eyebrow: string; title: string; linkLabel: string };
  testimonials: { visible: boolean; heading: string; subheading: string };
};

export type HeroSlide = {
  id: string;
  title: string;
  text: string;
  image: string;
};

export type ProgramIcon = 'book' | 'health' | 'users' | 'sprout' | 'heart' | 'relief';
export type PostKind = 'blog' | 'news' | 'event';

export type Program = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image: string;
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

export type CauseProduct = {
  id: string;
  name: string;
  image: string;
  needed: number;
  price: number;
  featured: boolean;
};

export type Cause = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story: string;
  image: string;
  images: string[];
  location: string;
  organizer: string;
  caption: string;
  raised: number;
  goal: number;
  donors: number;
  urgent: boolean;
  taxBenefit: boolean;
  published: boolean;
  products: CauseProduct[];
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
  causeSlug: string;
  causeTitle: string;
  orderId: string;
  paymentId: string;
  method: string;
  status: 'created' | 'paid' | 'failed';
  at: string;
};

export type VolunteerStatus = 'applied' | 'active' | 'inactive';
export type VolunteerRole = 'volunteer' | 'support' | 'fundraiser';
export type CollaborationStatus = 'new' | 'reviewed' | 'closed';
export type CollaborationKind = 'school' | 'company' | 'organisation' | 'inkind' | 'other';
export type UserRole = 'superAdmin' | 'admin' | 'editor';

export function asUserRole(value: string): UserRole {
  if (value === 'superAdmin' || value === 'editor') return value;
  return 'admin';
}

export function managesUsers(role: UserRole) {
  return role === 'superAdmin' || role === 'admin';
}
export type ReportKind = 'overview' | 'donations' | 'donors' | 'volunteers' | 'events';
export type ReportStatus = 'draft' | 'published';

export type Volunteer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: string;
  availability: string;
  role: VolunteerRole;
  title: string;
  image: string;
  status: VolunteerStatus;
  featured: boolean;
  notes: string;
  at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  published: boolean;
  at: string;
};

export type Collaboration = {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  kind: CollaborationKind;
  message: string;
  status: CollaborationStatus;
  at: string;
};

export type AppUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  active: boolean;
  at: string;
};

export type AuthUser = AppUser & { passwordHash: string };

export type ImageAsset = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  size: number;
  type: string;
  caption: string;
  entityType: string;
  entityId: string;
  at: string;
};

export type Report = {
  id: string;
  title: string;
  kind: ReportKind;
  periodStart: string;
  periodEnd: string;
  summary: string;
  payload: Record<string, number | string>;
  status: ReportStatus;
  at: string;
};

export type ManagedPage = {
  slug: string;
  title: string;
  kind: string;
  published: boolean;
  updatedAt: string;
};

export type DonationReceipt = {
  status: 'paid' | 'failed';
  name: string;
  email: string;
  phone: string;
  pan: string;
  address: string;
  country: string;
  amount: number;
  at: string;
  paymentId: string;
  method: string;
  message: string;
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
    latitude: string;
    longitude: string;
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  theme: SiteTheme;
  hero: { eyebrow: string; title: string; text: string; image: string; slides: HeroSlide[] };
  stats: { value: string; label: string }[];
  about: { eyebrow: string; title: string; text: string; quote: string; image: string };
  cta: { title: string; text: string };
  causes: Cause[];
  home: HomePageSettings;
  teamPeople: TeamPeopleCopy;
  banners: { slug: string; title: string; text: string; image: string }[];
  programs: Program[];
  posts: Post[];
  gallery: GalleryImage[];
  messages: ContactMessage[];
  donations: Donation[];
  volunteers: Volunteer[];
  testimonials: Testimonial[];
  collaborations: Collaboration[];
  users: AppUser[];
  images: ImageAsset[];
  reports: Report[];
  pages: ManagedPage[];
};
