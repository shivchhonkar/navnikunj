import type { HeroSlide, SiteData } from './types';

type IncomingHero = {
  eyebrow?: string;
  title?: string;
  text?: string;
  image?: string;
  slides?: Partial<HeroSlide>[];
};

export function withHeroSlides(hero: IncomingHero): SiteData['hero'] {
  const incoming = Array.isArray(hero.slides) ? hero.slides : [];
  const slides = incoming
    .map((slide, index) => ({
      id: String(slide?.id || `hero_${index + 1}`),
      title: String(slide?.title || '').trim(),
      text: String(slide?.text || '').trim(),
      image: String(slide?.image || '').trim(),
    }))
    .filter((slide) => slide.image || slide.title || slide.text);
  const list = slides.length
    ? slides
    : [{
      id: 'hero_1',
      title: String(hero.title || '').trim(),
      text: String(hero.text || '').trim(),
      image: String(hero.image || '').trim(),
    }].filter((slide) => slide.image || slide.title || slide.text);
  const first = list[0];
  return {
    eyebrow: String(hero.eyebrow || '').trim(),
    title: first?.title || String(hero.title || '').trim(),
    text: first?.text || String(hero.text || '').trim(),
    image: first?.image || String(hero.image || '').trim(),
    slides: list,
  };
}
