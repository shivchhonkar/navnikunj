import { randomBytes } from 'crypto';
import { cache } from 'react';
import type { PoolClient } from 'pg';
import { withTransaction } from './db';
import { withBanners } from './banners';
import { withHeroSlides } from './hero';
import { withHome } from './home';
import { blankSite, createSeed } from './seed';
import { asUserRole } from './types';
import type {
  ContactMessage,
  Donation,
  GalleryImage,
  ImageAsset,
  ManagedPage,
  Post,
  Program,
  ProgramIcon,
  Report,
  SiteData,
  Volunteer,
  AppUser,
} from './types';

const ICONS = new Set<ProgramIcon>(['book', 'health', 'users', 'sprout', 'heart', 'relief']);
const POST_KINDS = new Set(['blog', 'news', 'event']);
const DONATION_STATUS = new Set(['created', 'paid', 'failed']);

type PageRow = { slug: string; title: string; kind: string; content: unknown; published: boolean; updated_at: Date | string };

function ids(values: string[]) {
  return values.length ? values : ['__none__'];
}

function stamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function iso(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function filenameOf(url: string) {
  const clean = url.split('?')[0].split('#')[0];
  return clean.split('/').pop() || 'image';
}

function asIcon(value: string): ProgramIcon {
  return ICONS.has(value as ProgramIcon) ? value as ProgramIcon : 'heart';
}

function mapUser(row: {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: Date | string;
}): AppUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    role: asUserRole(row.role),
    active: row.active,
    at: iso(row.created_at),
  };
}

function mapImage(row: {
  id: string;
  filename: string;
  url: string;
  alt_text: string;
  size_bytes: number;
  mime_type: string;
  caption: string;
  entity_type: string;
  entity_id: string;
  created_at: Date | string;
}): ImageAsset {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    alt: row.alt_text,
    size: Number(row.size_bytes) || 0,
    type: row.mime_type,
    caption: row.caption,
    entityType: row.entity_type,
    entityId: row.entity_id,
    at: iso(row.created_at),
  };
}

async function upsertDonor(client: PoolClient, donation: Donation) {
  const pan = donation.pan.trim().toUpperCase();
  const email = donation.email.trim();
  const phone = donation.phone.trim();
  const found = pan
    ? await client.query<{ id: string }>(`SELECT id FROM donors WHERE pan = $1 LIMIT 1`, [pan])
    : await client.query<{ id: string }>(
      `SELECT id FROM donors WHERE pan = '' AND lower(email) = lower($1) AND phone = $2 LIMIT 1`,
      [email, phone],
    );
  const at = stamp(donation.at);
  if (found.rows[0]) {
    const id = found.rows[0].id;
    await client.query(
      `UPDATE donors SET name = $2, email = $3, phone = $4, pan = $5, address = $6, country = $7 WHERE id = $1`,
      [id, donation.name, email, phone, pan, donation.address, donation.country],
    );
    return id;
  }
  const id = `donor_${randomBytes(4).toString('hex')}`;
  await client.query(
    `INSERT INTO donors (id, name, email, phone, pan, address, country, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, donation.name, email, phone, pan, donation.address, donation.country, at],
  );
  return id;
}

async function saveImage(client: PoolClient, image: {
  id: string;
  url: string;
  alt: string;
  caption: string;
  entityType: string;
  entityId: string;
  sortOrder: number;
  size?: number;
  type?: string;
  at?: string;
}) {
  await client.query(
    `INSERT INTO images (id, filename, url, alt_text, size_bytes, mime_type, caption, entity_type, entity_id, sort_order, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       filename = EXCLUDED.filename,
       url = EXCLUDED.url,
       alt_text = EXCLUDED.alt_text,
       caption = EXCLUDED.caption,
       entity_type = EXCLUDED.entity_type,
       entity_id = EXCLUDED.entity_id,
       sort_order = EXCLUDED.sort_order,
       size_bytes = CASE WHEN EXCLUDED.size_bytes > 0 THEN EXCLUDED.size_bytes ELSE images.size_bytes END,
       mime_type = CASE WHEN EXCLUDED.mime_type <> '' THEN EXCLUDED.mime_type ELSE images.mime_type END`,
    [
      image.id,
      filenameOf(image.url),
      image.url,
      image.alt,
      image.size || 0,
      image.type || '',
      image.caption,
      image.entityType,
      image.entityId,
      image.sortOrder,
      image.at ? stamp(image.at) : new Date(),
    ],
  );
}

async function persist(client: PoolClient, site: SiteData) {
  const pages = [
    { slug: 'contact', title: 'Contact details', kind: 'contact', content: site.identity },
    { slug: 'hero', title: 'Home hero banner', kind: 'hero', content: site.hero },
    { slug: 'about', title: 'About page', kind: 'about', content: site.about },
    { slug: 'donation', title: 'Donation banner', kind: 'donation', content: site.cta },
    { slug: 'numbers', title: 'Impact numbers', kind: 'numbers', content: site.stats },
    { slug: 'programs', title: 'Programs', kind: 'programs', content: { count: site.programs.length } },
    { slug: 'home', title: 'Home page', kind: 'home', content: site.home },
    { slug: 'banners', title: 'Page banners', kind: 'banners', content: site.banners },
  ];
  for (const page of pages) {
    await client.query(
      `INSERT INTO pages (slug, title, kind, content, published, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, TRUE, NOW())
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, kind = EXCLUDED.kind, content = EXCLUDED.content, published = TRUE, updated_at = NOW()`,
      [page.slug, page.title, page.kind, JSON.stringify(page.content)],
    );
  }

  await client.query(`DELETE FROM stats`);
  for (const [index, stat] of site.stats.entries()) {
    await client.query(`INSERT INTO stats (sort_order, value, label) VALUES ($1, $2, $3)`, [index, stat.value, stat.label]);
  }

  await client.query(`DELETE FROM programs WHERE id <> ALL($1::text[])`, [ids(site.programs.map((item) => item.id))]);
  for (const [index, program] of site.programs.entries()) {
    await client.query(
      `INSERT INTO programs (id, slug, title, summary, body, icon, image, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, icon = EXCLUDED.icon, image = EXCLUDED.image, sort_order = EXCLUDED.sort_order`,
      [program.id, program.slug, program.title, program.summary, program.body, program.icon, program.image, index],
    );
  }
  const programImageIds = site.programs.filter((program) => program.image).map((program) => `imgfor_${program.id}`);
  await client.query(`DELETE FROM images WHERE entity_type = 'program' AND id <> ALL($1::text[])`, [ids(programImageIds)]);
  for (const [index, program] of site.programs.entries()) {
    if (!program.image) continue;
    await saveImage(client, {
      id: `imgfor_${program.id}`,
      url: program.image,
      alt: program.title,
      caption: program.summary,
      entityType: 'program',
      entityId: program.id,
      sortOrder: index,
    });
  }

  await client.query(`DELETE FROM posts WHERE id <> ALL($1::text[])`, [ids(site.posts.map((item) => item.id))]);
  for (const [index, post] of site.posts.entries()) {
    await client.query(
      `INSERT INTO posts (id, slug, kind, title, excerpt, body, image, post_date, location, keywords, published, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       ON CONFLICT (id) DO UPDATE SET
         slug = EXCLUDED.slug, kind = EXCLUDED.kind, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt,
         body = EXCLUDED.body, image = EXCLUDED.image, post_date = EXCLUDED.post_date, location = EXCLUDED.location,
         keywords = EXCLUDED.keywords, published = EXCLUDED.published, sort_order = EXCLUDED.sort_order, updated_at = NOW()`,
      [post.id, post.slug, post.kind, post.title, post.excerpt, post.body, post.image, post.date, post.location, post.keywords, post.published, index],
    );
  }

  await client.query(`DELETE FROM messages WHERE id <> ALL($1::text[])`, [ids(site.messages.map((item) => item.id))]);
  for (const [index, message] of site.messages.entries()) {
    await client.query(
      `INSERT INTO messages (id, name, email, phone, message, sort_order, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, message = EXCLUDED.message, sort_order = EXCLUDED.sort_order, created_at = EXCLUDED.created_at`,
      [message.id, message.name, message.email, message.phone, message.message, index, stamp(message.at)],
    );
  }

  await client.query(`DELETE FROM donations WHERE id <> ALL($1::text[])`, [ids(site.donations.map((item) => item.id))]);
  for (const [index, donation] of site.donations.entries()) {
    const donorId = await upsertDonor(client, donation);
    await client.query(
      `INSERT INTO donations (id, donor_id, name, email, phone, pan, address, country, amount, order_id, payment_id, method, status, sort_order, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         donor_id = EXCLUDED.donor_id, name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone,
         pan = EXCLUDED.pan, address = EXCLUDED.address, country = EXCLUDED.country, amount = EXCLUDED.amount,
         order_id = EXCLUDED.order_id, payment_id = EXCLUDED.payment_id, method = EXCLUDED.method,
         status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, created_at = EXCLUDED.created_at`,
      [
        donation.id,
        donorId,
        donation.name,
        donation.email,
        donation.phone,
        donation.pan.trim().toUpperCase(),
        donation.address,
        donation.country,
        donation.amount,
        donation.orderId,
        donation.paymentId,
        donation.method,
        donation.status,
        index,
        stamp(donation.at),
      ],
    );
  }

  await client.query(`DELETE FROM images WHERE entity_type = 'gallery' AND id <> ALL($1::text[])`, [ids(site.gallery.map((item) => item.id))]);
  for (const [index, image] of site.gallery.entries()) {
    await saveImage(client, {
      id: image.id,
      url: image.src,
      alt: image.alt,
      caption: image.caption,
      entityType: 'gallery',
      entityId: image.id,
      sortOrder: index,
    });
  }

  const postIds = site.posts.filter((post) => post.image).map((post) => post.id);
  await client.query(`DELETE FROM images WHERE entity_type = 'post' AND entity_id <> ALL($1::text[])`, [ids(postIds)]);
  for (const post of site.posts) {
    if (!post.image) continue;
    await saveImage(client, {
      id: `imgfor_${post.id}`,
      url: post.image,
      alt: post.title,
      caption: post.excerpt,
      entityType: 'post',
      entityId: post.id,
      sortOrder: 0,
    });
  }

  const heroSlides = withHeroSlides(site.hero).slides.filter((slide) => slide.image);
  const heroIds = heroSlides.map((slide) => `imgfor_${slide.id}`);
  await client.query(`DELETE FROM images WHERE entity_type = 'page' AND entity_id = 'hero' AND id <> ALL($1::text[])`, [ids(heroIds)]);
  for (const [index, slide] of heroSlides.entries()) {
    await saveImage(client, {
      id: `imgfor_${slide.id}`,
      url: slide.image,
      alt: slide.title,
      caption: slide.text,
      entityType: 'page',
      entityId: 'hero',
      sortOrder: index,
    });
  }
  if (site.about.image) {
    await saveImage(client, {
      id: 'imgfor_page_about',
      url: site.about.image,
      alt: site.about.title,
      caption: '',
      entityType: 'page',
      entityId: 'about',
      sortOrder: 0,
    });
  } else {
    await client.query(`DELETE FROM images WHERE id = $1`, ['imgfor_page_about']);
  }

  const homeImages = [
    { id: 'imgfor_home_stats', url: site.home.stats.image, alt: 'Impact numbers', entityId: 'home-stats' },
    { id: 'imgfor_home_about', url: site.home.about.image, alt: site.home.about.title, entityId: 'home-about' },
    { id: 'imgfor_home_donation', url: site.home.donation.image, alt: site.cta.title, entityId: 'home-donation' },
  ];
  for (const image of homeImages) {
    if (!image.url) {
      await client.query(`DELETE FROM images WHERE id = $1`, [image.id]);
      continue;
    }
    await saveImage(client, {
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: '',
      entityType: 'page',
      entityId: image.entityId,
      sortOrder: 0,
    });
  }

  const bannerIds = site.banners.map((banner) => `imgfor_banner_${banner.slug}`);
  await client.query(`DELETE FROM images WHERE entity_type = 'page' AND entity_id LIKE 'banner-%' AND id <> ALL($1::text[])`, [ids(bannerIds)]);
  for (const [index, banner] of site.banners.entries()) {
    if (!banner.image) continue;
    await saveImage(client, {
      id: `imgfor_banner_${banner.slug}`,
      url: banner.image,
      alt: banner.title,
      caption: banner.text,
      entityType: 'page',
      entityId: `banner-${banner.slug}`,
      sortOrder: index,
    });
  }
}

async function load(client: PoolClient): Promise<SiteData> {
  const fallback = blankSite();
  const [pageRows, statRows, programRows, postRows, messageRows, donationRows, userRows, imageRows, volunteerRows, reportRows] = await Promise.all([
    client.query<PageRow>(`SELECT slug, title, kind, content, published, updated_at FROM pages ORDER BY slug`),
    client.query<{ value: string; label: string }>(`SELECT value, label FROM stats ORDER BY sort_order`),
    client.query<{ id: string; slug: string; title: string; summary: string; body: string; icon: string; image: string }>(`SELECT id, slug, title, summary, body, icon, image FROM programs ORDER BY sort_order, title`),
    client.query<{ id: string; slug: string; kind: string; title: string; excerpt: string; body: string; image: string; post_date: string; location: string; keywords: string; published: boolean }>(`SELECT id, slug, kind, title, excerpt, body, image, post_date, location, keywords, published FROM posts ORDER BY sort_order, post_date DESC`),
    client.query<{ id: string; name: string; email: string; phone: string; message: string; created_at: Date }>(`SELECT id, name, email, phone, message, created_at FROM messages ORDER BY sort_order, created_at DESC`),
    client.query<{ id: string; name: string; email: string; phone: string; pan: string; address: string; country: string; amount: string; order_id: string; payment_id: string; method: string; status: string; created_at: Date }>(`SELECT id, name, email, phone, pan, address, country, amount, order_id, payment_id, method, status, created_at FROM donations ORDER BY sort_order, created_at DESC`),
    client.query<{ id: string; username: string; password_hash: string; display_name: string; email: string; role: string; active: boolean; created_at: Date }>(`SELECT id, username, password_hash, display_name, email, role, active, created_at FROM users ORDER BY created_at`),
    client.query<{ id: string; filename: string; url: string; alt_text: string; size_bytes: number; mime_type: string; caption: string; entity_type: string; entity_id: string; sort_order: number; created_at: Date }>(`SELECT id, filename, url, alt_text, size_bytes, mime_type, caption, entity_type, entity_id, sort_order, created_at FROM images ORDER BY created_at DESC`),
    client.query<{ id: string; name: string; email: string; phone: string; city: string; skills: string; availability: string; status: string; notes: string; created_at: Date }>(`SELECT id, name, email, phone, city, skills, availability, status, notes, created_at FROM volunteers ORDER BY created_at DESC`),
    client.query<{ id: string; title: string; kind: string; period_start: string; period_end: string; summary: string; payload: Record<string, number | string>; status: string; created_at: Date }>(`SELECT id, title, kind, period_start, period_end, summary, payload, status, created_at FROM reports ORDER BY created_at DESC`),
  ]);

  const pagesBySlug = new Map(pageRows.rows.map((row) => [row.slug, row]));
  const content = <T>(slug: string, fallbackValue: T): T => {
    const row = pagesBySlug.get(slug);
    if (!row || row.content == null) return fallbackValue;
    return row.content as T;
  };
  const identity = { ...fallback.identity, ...content('contact', fallback.identity) };
  identity.phone2 ||= '';
  identity.phoneHref2 ||= '';
  identity.latitude ||= '';
  identity.longitude ||= '';
  const stats = statRows.rows.map((row) => ({ value: row.value, label: row.label }));
  const admin = userRows.rows.find((row) => row.active && (row.role === 'admin' || row.role === 'superAdmin')) || userRows.rows[0];
  const images = imageRows.rows.map(mapImage);
  const gallery: GalleryImage[] = [...imageRows.rows]
    .filter((image) => image.entity_type === 'gallery')
    .sort((a, b) => a.sort_order - b.sort_order || +new Date(b.created_at) - +new Date(a.created_at))
    .map((image) => ({ id: image.id, src: image.url, alt: image.alt_text, caption: image.caption }));

  const posts: Post[] = postRows.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    kind: POST_KINDS.has(row.kind) ? row.kind as Post['kind'] : 'news',
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    image: row.image,
    date: row.post_date,
    location: row.location,
    keywords: row.keywords || '',
    published: row.published,
  }));
  const programs: Program[] = programRows.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    image: row.image || '',
    icon: asIcon(row.icon),
  }));
  const messages: ContactMessage[] = messageRows.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    at: iso(row.created_at),
  }));
  const donations: Donation[] = donationRows.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    pan: row.pan || '',
    address: row.address || '',
    country: row.country || '',
    amount: Number(row.amount) || 0,
    orderId: row.order_id,
    paymentId: row.payment_id,
    method: row.method || '',
    status: DONATION_STATUS.has(row.status) ? row.status as Donation['status'] : 'created',
    at: iso(row.created_at),
  }));
  const volunteers: Volunteer[] = volunteerRows.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    skills: row.skills,
    availability: row.availability,
    status: row.status === 'active' || row.status === 'inactive' ? row.status : 'applied',
    notes: row.notes,
    at: iso(row.created_at),
  }));
  const users: AppUser[] = userRows.rows.map(mapUser);
  const reports: Report[] = reportRows.rows.map((row) => ({
    id: row.id,
    title: row.title,
    kind: row.kind as Report['kind'],
    periodStart: row.period_start,
    periodEnd: row.period_end,
    summary: row.summary,
    payload: row.payload || {},
    status: row.status === 'published' ? 'published' : 'draft',
    at: iso(row.created_at),
  }));
  const pages: ManagedPage[] = pageRows.rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    published: row.published,
    updatedAt: iso(row.updated_at),
  }));

  return {
    adminUser: admin?.username || fallback.adminUser,
    passwordHash: admin?.password_hash || fallback.passwordHash,
    identity,
    hero: withHeroSlides({ ...fallback.hero, ...content('hero', fallback.hero) }),
    stats,
    about: { ...fallback.about, ...content('about', fallback.about) },
    cta: { ...fallback.cta, ...content('donation', fallback.cta) },
    home: withHome(content('home', fallback.home)),
    banners: withBanners(content('banners', fallback.banners)),
    programs,
    posts,
    gallery,
    messages,
    donations,
    volunteers,
    users,
    images,
    reports,
    pages,
  };
}

async function seedIfEmpty(client: PoolClient) {
  const count = await client.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM users`);
  if (count.rows[0]?.n) return;
  const site = createSeed();
  await client.query(
    `INSERT INTO users (id, username, password_hash, display_name, email, role, active)
     VALUES ($1, $2, $3, $4, $5, 'admin', TRUE)
     ON CONFLICT (username) DO NOTHING`,
    ['user_admin', site.adminUser, site.passwordHash, 'Admin', site.identity.email],
  );
  await persist(client, site);
}

async function readSite() {
  return withTransaction(async (client) => {
    await client.query(`SELECT pg_advisory_xact_lock(481516234)`);
    await seedIfEmpty(client);
    return load(client);
  });
}

export const getSite = cache(readSite);

export async function updateSite(change: (site: SiteData) => void) {
  return withTransaction(async (client) => {
    await client.query(`SELECT pg_advisory_xact_lock(481516234)`);
    await seedIfEmpty(client);
    const site = await load(client);
    change(site);
    await persist(client, site);
    return site;
  });
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7200';
}

