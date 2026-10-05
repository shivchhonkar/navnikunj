import { defaultBanners } from './banners';
import { defaultHome } from './home';
import { PROGRAM_PHOTOS } from './programs';
import { DEMO_PASSWORD, hashPassword } from './password';
import type { SiteData } from './types';

function buildSite(passwordHash: string): SiteData {
  return {
    adminUser: 'admin',
    passwordHash,
    identity: {
      name: 'Navnikunj Foundation',
      tagline: 'Kindness · Hope · Better tomorrows',
      email: 'info@navnikunjfoundation.com',
      phone: '+91 9720202640',
      phoneHref: '+919720202640',
      phone2: '+91 9720202650',
      phoneHref2: '+919720202650',
      address: 'NAVNIKUNJ FOUNDATION\nLIG-12A/107, Suncity Anantam Kunj, Vrindaban,\nMathura- 281121, Uttar Pradesh, India',
      mapQuery: 'LIG-12A/107, Suncity Anantam Kunj, Vrindaban, Mathura 281121, Uttar Pradesh, India',
      latitude: '',
      longitude: '',
      facebook: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
    hero: {
      eyebrow: 'Serving society through',
      title: 'Kindness that opens a better tomorrow',
      text: 'We stand with families who need a school place, a health visit, a meal, or a skill they can use. Every gift is tracked, and every program is built to last beyond a single day.',
      image: '/images/banner_images/banner-poor-childrens.jpeg',
      slides: [
        {
          id: 'hero_1',
          title: 'Kindness that opens a better tomorrow',
          text: 'We stand with families who need a school place, a health visit, a meal, or a skill they can use. Every gift is tracked, and every program is built to last beyond a single day.',
          image: '/images/banner_images/banner-poor-childrens.jpeg',
        },
      ],
    },
    stats: [
      { value: '1,200+', label: 'People supported' },
      { value: '18', label: 'Community programs' },
      { value: '6', label: 'Learning circles' },
      { value: '100%', label: 'Gifts recorded' },
    ],
    about: {
      eyebrow: 'About us',
      title: 'A foundation built on kindness, hope, and practical help',
      text: 'Navnikunj Foundation brings neighbours, teachers, and volunteers together so support reaches people in time. We focus on learning, health, family relief, work skills, and cleaner shared spaces. The work is local, the records are open to the team, and the aim is simple: help someone stand a little steadier.',
      quote: 'Kindness is the shortest path to a better tomorrow.',
      image: '',
    },
    cta: {
      title: 'Be part of the change',
      text: 'Your support keeps school kits, health camps, and family relief moving. Give once, or come back when you can.',
    },
    home: defaultHome(),
    banners: defaultBanners(),
    programs: [
      {
        id: 'pg_poverty',
        slug: 'poverty-alleviation',
        title: 'Poverty alleviation',
        summary: 'Food, essentials, and steady support for families working through a hard stretch.',
        body: 'Poverty alleviation covers ration support, daily essentials, and a follow-up when a household is short of what it needs to get through the month. The help is personal and recorded.',
        image: PROGRAM_PHOTOS['poverty-alleviation'],
        icon: 'heart',
      },
      {
        id: 'pg_education',
        slug: 'education-and-skill-development',
        title: 'Education and skill development',
        summary: 'School kits, fees, and practical training so children stay in class and young people can earn.',
        body: 'Education and skill development covers notebooks, uniforms, fee help, and short courses in communication, computer basics, and local trades. The aim is a child who stays in school and a learner ready for a first job.',
        image: PROGRAM_PHOTOS['education-and-skill-development'],
        icon: 'book',
      },
      {
        id: 'pg_health',
        slug: 'community-health-and-nutrition',
        title: 'Community health and nutrition',
        summary: 'Health camps, basic care, and nutritious food close to the neighbourhoods we serve.',
        body: 'Community health and nutrition days bring a doctor, basic checks, and food support that keeps a family fed. We tell people what was found and where to go if more care is needed.',
        image: PROGRAM_PHOTOS['community-health-and-nutrition'],
        icon: 'health',
      },
      {
        id: 'pg_welfare',
        slug: 'women-and-child-welfare',
        title: 'Women and child welfare',
        summary: 'Care, learning, and livelihood support that keeps women and children safer and more able.',
        body: 'Women and child welfare supports education, nutrition, safety, and a chance for women to build a skill or a small livelihood. Children are included so care and learning travel together.',
        image: PROGRAM_PHOTOS['women-and-child-welfare'],
        icon: 'users',
      },
      {
        id: 'pg_environment',
        slug: 'environmental-sustainability',
        title: 'Environmental sustainability',
        summary: 'Tree planting and clean-up drives that leave a street better than we found it.',
        body: 'Environmental sustainability brings neighbours together to plant, water, and clear shared corners. Children join so looking after a place becomes a habit.',
        image: PROGRAM_PHOTOS['environmental-sustainability'],
        icon: 'sprout',
      },
      {
        id: 'pg_disaster',
        slug: 'disaster-relief',
        title: 'Disaster relief',
        summary: 'Food, shelter basics, and a follow-up visit when a flood, fire, or other emergency hits.',
        body: 'Disaster relief moves quickly with food, daily essentials, and a check on households after the first shock. The help is short, practical, and recorded.',
        image: PROGRAM_PHOTOS['disaster-relief'],
        icon: 'relief',
      },
    ],
    posts: [
      {
        id: 'post_kits',
        slug: 'school-kit-drive',
        kind: 'news',
        title: 'School kit drive opens for the new term',
        excerpt: 'Notebooks, bags, and uniforms are being packed for children starting the term without supplies.',
        body: 'Volunteers are packing school kits this month. Each kit has notebooks, a bag, and the uniform pieces a school has asked for. Families can request a kit through the learning support program, and donors can cover a kit from the donate page.',
        image: '',
        date: '2026-08-20',
        location: 'Community centre',
        keywords: 'school kits, education, children',
        published: true,
      },
      {
        id: 'post_camp',
        slug: 'neighbourhood-health-camp',
        kind: 'event',
        title: 'Neighbourhood health camp',
        excerpt: 'A one-day camp for basic checks, with time set aside for parents and older residents.',
        body: 'The health camp runs from morning until late afternoon. Bring any earlier reports you have. Children, parents, and older residents are welcome. There is no fee.',
        image: '',
        date: '2026-09-12',
        location: 'Neighbourhood park gate',
        keywords: 'health camp, community health',
        published: true,
      },
      {
        id: 'post_sunday',
        slug: 'why-we-record-every-gift',
        kind: 'blog',
        title: 'Why we record every gift',
        excerpt: 'A short note on how donations are logged, so supporters can see that help reached a program.',
        body: 'Every donation is stored with a name, an amount, and a payment reference once Razorpay confirms it. The admin desk shows paid and unfinished checkouts separately. That record is how the team matches a gift to school kits, a health camp, or family relief.',
        image: '',
        date: '2026-07-28',
        location: '',
        keywords: 'donations, transparency',
        published: true,
      },
    ],
    gallery: [],
    messages: [],
    donations: [],
    volunteers: [],
    users: [],
    images: [],
    reports: [],
    pages: [],
  };
}

export function blankSite() {
  return buildSite('');
}

export function createSeed(): SiteData {
  return buildSite(hashPassword(DEMO_PASSWORD));
}
