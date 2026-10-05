import type { HomePageSettings } from './types';

export function defaultHome(): HomePageSettings {
  return {
    stats: { visible: true, image: '/images/bg_images/stats_bg.png' },
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
    donation: { visible: true, image: '/images/LOGO_NT.svg', buttonLabel: 'Donate Now' },
    news: { visible: true, eyebrow: 'Latest updates', title: 'News & Updates', linkLabel: 'View all' },
  };
}

function str(value: unknown, fallback: string) {
  return typeof value === 'string' ? value.trim() : fallback;
}

function on(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function section<T extends object>(value: T | undefined): Partial<T> {
  return value && typeof value === 'object' ? value : {};
}

export function withHome(value: unknown): HomePageSettings {
  const base = defaultHome();
  const source = value && typeof value === 'object' ? value as Partial<HomePageSettings> : {};
  const stats = section(source.stats);
  const work = section(source.work);
  const about = section(source.about);
  const donation = section(source.donation);
  const news = section(source.news);
  const donationImage = str(donation.image, base.donation.image);
  return {
    stats: { visible: on(stats.visible, base.stats.visible), image: str(stats.image, base.stats.image) },
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
  };
}
