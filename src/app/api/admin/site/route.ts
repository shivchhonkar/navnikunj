import { isAdmin } from '@/lib/auth';
import { parseMapPoint } from '@/lib/map';
import { withBanners } from '@/lib/banners';
import { withHeroSlides } from '@/lib/hero';
import { withHome } from '@/lib/home';
import { fail, json, slugify, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import type { Program, ProgramIcon } from '@/lib/types';
import { randomBytes } from 'crypto';

const ICONS = new Set(['book', 'health', 'users', 'sprout', 'heart', 'relief']);

export async function PUT(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  const heroSlides = body.hero && typeof body.hero === 'object'
    ? withHeroSlides({
      eyebrow: text(body.hero.eyebrow),
      title: text(body.hero.title),
      text: text(body.hero.text),
      image: text(body.hero.image),
      slides: Array.isArray(body.hero.slides) ? body.hero.slides.slice(0, 8) : undefined,
    }).slides
    : null;
  if (heroSlides) {
    const images = heroSlides.map((slide) => slide.image).filter(Boolean);
    if (!heroSlides.length) return fail('Add at least one slide.');
    if (new Set(images).size !== images.length) return fail('Each slide needs its own image.');
    if (heroSlides.some((slide) => !slide.image || !slide.title || !slide.text)) return fail('Each slide needs an image, a headline, and text.');
  }
  if (body.identity && typeof body.identity === 'object') {
    const latitude = text(body.identity.latitude);
    const longitude = text(body.identity.longitude);
    if ((latitude && !longitude) || (!latitude && longitude)) return fail('Enter both latitude and longitude.');
    if (latitude && longitude && !parseMapPoint(`${latitude},${longitude}`)) return fail('Check the latitude and longitude.');
  }
  await updateSite((site) => {
    if (body.identity && typeof body.identity === 'object') {
      for (const key of ['name', 'tagline', 'email', 'phone', 'phoneHref', 'phone2', 'phoneHref2', 'address', 'mapQuery', 'latitude', 'longitude', 'facebook', 'instagram', 'youtube', 'linkedin'] as const) {
        if (key in body.identity) site.identity[key] = text(body.identity[key]);
      }
    }
    if (heroSlides && body.hero && typeof body.hero === 'object') {
      const first = heroSlides[0];
      site.hero = {
        eyebrow: text(body.hero.eyebrow),
        title: first?.title || '',
        text: first?.text || '',
        image: first?.image || '',
        slides: heroSlides.map((slide) => ({
          id: text(slide.id) || `hero_${randomBytes(3).toString('hex')}`,
          title: slide.title,
          text: slide.text,
          image: slide.image,
        })),
      };
    }
    if (body.about && typeof body.about === 'object') {
      site.about = {
        eyebrow: text(body.about.eyebrow),
        title: text(body.about.title),
        text: text(body.about.text),
        quote: text(body.about.quote),
        image: text(body.about.image),
      };
    }
    if (body.cta && typeof body.cta === 'object') {
      site.cta = { title: text(body.cta.title), text: text(body.cta.text) };
    }
    if (body.home && typeof body.home === 'object') site.home = withHome(body.home);
    if (Array.isArray(body.banners)) site.banners = withBanners(body.banners);
    if (Array.isArray(body.stats)) {
      site.stats = body.stats.slice(0, 6).map((item: { value?: string; label?: string }) => ({
        value: text(item.value),
        label: text(item.label),
      })).filter((item: { value: string; label: string }) => item.value && item.label);
    }
    if (Array.isArray(body.programs)) {
      const used = new Set<string>();
      site.programs = body.programs.slice(0, 12).map((item: Partial<Program>) => {
        const title = text(item.title);
        let slug = slugify(text(item.slug) || title);
        while (used.has(slug)) slug = `${slug}-${randomBytes(1).toString('hex')}`;
        used.add(slug);
        const icon = ICONS.has(String(item.icon)) ? item.icon as ProgramIcon : 'heart';
        return {
          id: text(item.id) || `pg_${randomBytes(3).toString('hex')}`,
          slug,
          title,
          summary: text(item.summary),
          body: text(item.body),
          image: text(item.image),
          icon,
        };
      }).filter((item: Program) => item.title);
    }
  });
  return json({ ok: true });
}
