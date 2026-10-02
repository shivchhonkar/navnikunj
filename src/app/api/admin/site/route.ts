import { isAdmin } from '@/lib/auth';
import { fail, json, slugify, text } from '@/lib/http';
import { updateSite } from '@/lib/store';
import type { Program, ProgramIcon } from '@/lib/types';
import { randomBytes } from 'crypto';

const ICONS = new Set(['book', 'health', 'users', 'sprout', 'heart']);

export async function PUT(request: Request) {
  if (!isAdmin()) return fail('Sign in required', 401);
  const body = await request.json().catch(() => ({}));
  updateSite((site) => {
    if (body.identity && typeof body.identity === 'object') {
      for (const key of ['name', 'tagline', 'email', 'phone', 'phoneHref', 'phone2', 'phoneHref2', 'address', 'mapQuery', 'facebook', 'instagram', 'youtube', 'linkedin'] as const) {
        if (key in body.identity) site.identity[key] = text(body.identity[key]);
      }
    }
    if (body.hero && typeof body.hero === 'object') {
      site.hero = {
        eyebrow: text(body.hero.eyebrow),
        title: text(body.hero.title),
        text: text(body.hero.text),
        image: text(body.hero.image),
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
          icon,
        };
      }).filter((item: Program) => item.title);
    }
  });
  return json({ ok: true });
}
