import { hexChannels } from './theme';
import type { HomePageSettings, TakePartCard, TakePartKey } from './types';

export const STATS_BACKGROUND = '#fcf2e4';

export function defaultHome(): HomePageSettings {
  return {
    stats: { visible: true, image: '/images/bg_images/stats_bg.png', color: STATS_BACKGROUND },
    work: {
      visible: true,
      eyebrow: 'Our focus areas',
      title: 'Where the work goes',
      text: 'Poverty alleviation, Education and skill development, Community health and nutrition, women and child welfare, environmental sustainability, disaster relief. Open a program to see what it covers.',
      linkLabel: 'See all programs',
      cardLabel: 'Learn More',
    },
    about: {
      visible: true,
      eyebrow: 'Who we are',
      title: 'Who we are?',
      text: 'Navnikunj Foundation is a non-profit organization dedicated to empowering underserved communities and creating sustainable social impact. Guided by compassion, integrity, and social responsibility, we work to ensure that every individual has access to basic necessities, opportunities, and a life of dignity.',
      detail: 'Our work covers poverty alleviation, food and nutrition, healthcare, education, skill development, women and child welfare, environmental sustainability, and community development.',
      quote: 'Together, we can make a difference.',
      image: '',
      linkLabel: 'Our story',
    },
    takePart: {
      visible: true,
      eyebrow: 'Take part',
      title: 'There is more than one way to help',
      text: 'Give time, support the team, raise funds, or bring an organisation alongside the work.',
      cards: [
        { key: 'volunteer', title: 'Volunteer', text: 'Give time at a program or a drive.' },
        { key: 'support', title: 'Support team', text: 'Help with coordination and follow-up.' },
        { key: 'fundraiser', title: 'Fund raiser', text: 'Raise support through people you know.' },
        { key: 'collaborate', title: 'Collaborate', text: 'Partner as a school, company, or organisation.' },
      ],
    },
    donation: { visible: true, image: '/images/LOGO_NT.svg', buttonLabel: 'Donate Now' },
    news: { visible: true, eyebrow: 'Latest updates', title: 'News & Updates', linkLabel: 'View all' },
    testimonials: { visible: true, heading: 'In their words', subheading: 'Testimonials' },
  };
}

function str(value: unknown, fallback: string) {
  return typeof value === 'string' ? value.trim() : fallback;
}

function on(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function color(value: unknown, fallback: string) {
  return typeof value === 'string' && hexChannels(value) ? value.trim().toLowerCase() : fallback;
}

function section<T extends object>(value: T | undefined): Partial<T> {
  return value && typeof value === 'object' ? value : {};
}

const TAKE_PART_KEYS: TakePartKey[] = ['volunteer', 'support', 'fundraiser', 'collaborate'];

function takePartCards(value: unknown, base: TakePartCard[]): TakePartCard[] {
  const rows = Array.isArray(value) ? value : [];
  return TAKE_PART_KEYS.map((key) => {
    const fallback = base.find((card) => card.key === key) ?? { key, title: '', text: '' };
    const match = rows.find((row) => row && typeof row === 'object' && (row as { key?: unknown }).key === key);
    const source = match && typeof match === 'object' ? match as Partial<TakePartCard> : {};
    return { key, title: str(source.title, fallback.title), text: str(source.text, fallback.text) };
  });
}

export function withHome(value: unknown): HomePageSettings {
  const base = defaultHome();
  const source = value && typeof value === 'object' ? value as Partial<HomePageSettings> : {};
  const stats = section(source.stats);
  const work = section(source.work);
  const about = section(source.about);
  const takePart = section(source.takePart);
  const donation = section(source.donation);
  const news = section(source.news);
  const testimonials = section(source.testimonials);
  const donationImage = str(donation.image, base.donation.image);
  return {
    stats: { visible: on(stats.visible, base.stats.visible), image: str(stats.image, base.stats.image), color: color(stats.color, base.stats.color) },
    work: {
      visible: on(work.visible, base.work.visible),
      eyebrow: str(work.eyebrow, base.work.eyebrow),
      title: str(work.title, base.work.title),
      text: str(work.text, base.work.text),
      linkLabel: str(work.linkLabel, base.work.linkLabel),
      cardLabel: str(work.cardLabel, base.work.cardLabel),
    },
    about: {
      visible: on(about.visible, base.about.visible),
      eyebrow: str(about.eyebrow, base.about.eyebrow),
      title: str(about.title, base.about.title),
      text: str(about.text, base.about.text),
      detail: str(about.detail, base.about.detail),
      quote: str(about.quote, base.about.quote),
      image: str(about.image, base.about.image),
      linkLabel: str(about.linkLabel, base.about.linkLabel),
    },
    takePart: {
      visible: on(takePart.visible, base.takePart.visible),
      eyebrow: str(takePart.eyebrow, base.takePart.eyebrow),
      title: str(takePart.title, base.takePart.title),
      text: str(takePart.text, base.takePart.text),
      cards: takePartCards(takePart.cards, base.takePart.cards),
    },
    donation: {
      visible: on(donation.visible, base.donation.visible),
      image: donationImage === '/images/logo.svg' ? base.donation.image : donationImage,
      buttonLabel: str(donation.buttonLabel, base.donation.buttonLabel),
    },
    news: {
      visible: on(news.visible, base.news.visible),
      eyebrow: str(news.eyebrow, base.news.eyebrow),
      title: str(news.title, base.news.title),
      linkLabel: str(news.linkLabel, base.news.linkLabel),
    },
    testimonials: {
      visible: on(testimonials.visible, base.testimonials.visible),
      heading: str(testimonials.heading, base.testimonials.heading),
      subheading: str(testimonials.subheading, base.testimonials.subheading),
    },
  };
}
