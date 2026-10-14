import { randomBytes } from 'crypto';
import { slugify, text } from '@/lib/http';
import type { Cause, CauseProduct } from '@/lib/types';

const PHOTOS = {
  medical: '/images/causes/medical-india.jpg',
  seniors: '/images/causes/seniors-india.jpg',
  children: '/images/causes/children-india.jpg',
  abled: '/images/causes/abled-india.jpg',
  hunger: '/images/causes/hunger-india.jpg',
  disaster: '/images/causes/disaster-india.jpg',
  women: '/images/causes/women-india.jpg',
  gaumata: '/images/causes/gaumata-india.jpg',
  groceries: '/images/causes/groceries-india.jpg',
  hygiene: '/images/causes/hygiene.jpg',
  rice: '/images/causes/rice.jpg',
  fodder: '/images/causes/fodder-india.jpg',
  kit: '/images/causes/kit.jpg',
};

function product(id: string, name: string, image: string, needed: number, price: number, featured = false): CauseProduct {
  return { id, name, image, needed, price, featured };
}

export function defaultCauses(): Cause[] {
  return [
    {
      id: 'cause_medical',
      slug: 'emergency-medical-support',
      title: 'Emergency medical support',
      summary: 'Help a family cover an urgent hospital bill, medicine, or a procedure they cannot postpone.',
      story: 'A sudden illness can empty a household in a week. This cause pays for treatment, travel to the hospital, and the medicines that follow discharge.',
      image: PHOTOS.medical,
      images: [PHOTOS.medical],
      location: 'Uttar Pradesh',
      organizer: 'Navnikunj Foundation',
      caption: 'Support urgent treatment',
      raised: 826436,
      goal: 1200000,
      donors: 585,
      urgent: true,
      taxBenefit: true,
      published: true,
      products: [
        product('med_kit', 'Medicine kit', PHOTOS.kit, 420, 850, true),
        product('med_consult', 'Doctor visit', PHOTOS.medical, 180, 1200),
        product('med_travel', 'Hospital travel', PHOTOS.hygiene, 96, 650),
      ],
    },
    {
      id: 'cause_seniors',
      slug: 'homeless-senior-citizen-support',
      title: 'Homeless Senior citizen support',
      summary: 'Meals, a bed, and basic care for older people who have nowhere steady to stay.',
      story: 'Many seniors in our towns sleep outside or in temporary shelters. Gifts here cover food, a cot, winter clothing, and a health check.',
      image: PHOTOS.seniors,
      images: [PHOTOS.seniors],
      location: 'Mathura',
      organizer: 'Navnikunj Foundation',
      caption: 'Support senior citizens',
      raised: 338075,
      goal: 800000,
      donors: 244,
      urgent: false,
      taxBenefit: true,
      published: true,
      products: [
        product('senior_meal', 'Meal for a week', PHOTOS.groceries, 640, 490, true),
        product('senior_blanket', 'Winter kit', PHOTOS.kit, 210, 750),
        product('senior_care', 'Health check', PHOTOS.medical, 120, 600),
      ],
    },
    {
      id: 'cause_children',
      slug: 'underprivileged-children-education-health',
      title: 'Underprivileged children education & health',
      summary: 'School kits, meals, and health camps for children who would otherwise miss class.',
      story: 'A notebook, a midday meal, and a health visit keep a child in school. This cause funds all three through the year.',
      image: PHOTOS.children,
      images: [PHOTOS.children],
      location: 'Maharashtra',
      organizer: 'Navnikunj Foundation',
      caption: 'Support 50 children',
      raised: 162038,
      goal: 500000,
      donors: 72,
      urgent: true,
      taxBenefit: true,
      published: true,
      products: [
        product('child_groceries', 'Groceries kit', PHOTOS.groceries, 1781, 650, true),
        product('child_hygiene', 'Hygiene kit', PHOTOS.hygiene, 1457, 610),
        product('child_rice', 'Rice 12kg', PHOTOS.rice, 961, 685),
      ],
    },
    {
      id: 'cause_abled',
      slug: 'specially-abled',
      title: 'Specially abled',
      summary: 'Therapy, learning aids, and daily support for children and adults with disabilities.',
      story: 'Aids and regular therapy are what make a classroom or a job reachable. Gifts here stay with that support, not a one-time event.',
      image: PHOTOS.abled,
      images: [PHOTOS.abled],
      location: 'Delhi NCR',
      organizer: 'Navnikunj Foundation',
      caption: 'Support therapy and aids',
      raised: 214500,
      goal: 600000,
      donors: 128,
      urgent: false,
      taxBenefit: true,
      published: true,
      products: [
        product('abled_session', 'Therapy session', PHOTOS.abled, 300, 800, true),
        product('abled_aid', 'Learning aid', PHOTOS.kit, 140, 1100),
        product('abled_care', 'Care kit', PHOTOS.hygiene, 220, 540),
      ],
    },
    {
      id: 'cause_hunger',
      slug: 'hunger-management',
      title: 'Hunger management',
      summary: 'Cooked meals and ration kits for families who are skipping food to get through the week.',
      story: 'Hunger shows up as a missed meal long before it shows up as a headline. This cause stocks kitchens and hands out ration that lasts.',
      image: PHOTOS.hunger,
      images: [PHOTOS.hunger],
      location: 'Vrindavan',
      organizer: 'Navnikunj Foundation',
      caption: 'Support a community kitchen',
      raised: 451200,
      goal: 900000,
      donors: 310,
      urgent: true,
      taxBenefit: true,
      published: true,
      products: [
        product('hunger_meal', 'Meal for 10', PHOTOS.hunger, 900, 350, true),
        product('hunger_rice', 'Rice 12kg', PHOTOS.rice, 540, 685),
        product('hunger_grocery', 'Groceries kit', PHOTOS.groceries, 400, 650),
      ],
    },
    {
      id: 'cause_disaster',
      slug: 'disaster-relief',
      title: 'Disaster relief',
      summary: 'Dry rations, tarpaulins, and first aid after a flood, fire, or other sudden loss.',
      story: 'When a home is gone overnight, families need water, food, and a dry place before anything else. Relief kits go out as soon as a gift clears.',
      image: PHOTOS.disaster,
      images: [PHOTOS.disaster],
      location: 'North India',
      organizer: 'Navnikunj Foundation',
      caption: 'Support a relief kit',
      raised: 590000,
      goal: 1500000,
      donors: 402,
      urgent: true,
      taxBenefit: true,
      published: true,
      products: [
        product('relief_kit', 'Family relief kit', PHOTOS.kit, 700, 1500, true),
        product('relief_food', 'Ration pack', PHOTOS.groceries, 800, 750),
        product('relief_care', 'First-aid kit', PHOTOS.medical, 260, 480),
      ],
    },
    {
      id: 'cause_women',
      slug: 'women-empowerment',
      title: 'Women Empowerment',
      summary: 'Skill training, a small work kit, and support so women can earn in their own name.',
      story: 'A sewing kit, a stall, or a short course is often the difference between depending on someone and running a day’s work. This cause funds that start.',
      image: PHOTOS.women,
      images: [PHOTOS.women],
      location: 'Uttar Pradesh',
      organizer: 'Navnikunj Foundation',
      caption: 'Support a woman-led start',
      raised: 188400,
      goal: 450000,
      donors: 96,
      urgent: false,
      taxBenefit: true,
      published: true,
      products: [
        product('women_kit', 'Work kit', PHOTOS.kit, 220, 1800, true),
        product('women_course', 'Skill session', PHOTOS.women, 160, 900),
        product('women_grocery', 'Family groceries', PHOTOS.groceries, 300, 650),
      ],
    },
    {
      id: 'cause_gaumata',
      slug: 'gaumata-dan-and-seva',
      title: 'Gaumata dan and seva',
      summary: 'Fodder, care, and shelter for cows looked after in the gaushala.',
      story: 'Daily fodder and a clean shelter are the seva this cause keeps going. Gifts can be a food kit, green fodder, or a share of the upkeep.',
      image: PHOTOS.gaumata,
      images: [PHOTOS.gaumata],
      location: 'Vrindavan',
      organizer: 'Navnikunj Foundation',
      caption: 'Support 300+ nandis',
      raised: 275000,
      goal: 700000,
      donors: 190,
      urgent: false,
      taxBenefit: true,
      published: true,
      products: [
        product('gau_food', 'Cow food kit', PHOTOS.fodder, 1823, 640, true),
        product('gau_care', 'Care and shelter', PHOTOS.gaumata, 1444, 650),
        product('gau_green', 'Green fodder', PHOTOS.fodder, 884, 500),
      ],
    },
  ];
}

function money(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}

function flag(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function productsOf(value: unknown, causeId: string): CauseProduct[] {
  if (!Array.isArray(value)) return [];
  const used = new Set<string>();
  return value.slice(0, 8).flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<CauseProduct>;
    const name = text(row.name);
    if (!name) return [];
    let id = text(row.id) || `${causeId}_p${index + 1}`;
    while (used.has(id)) id = `${id}_${randomBytes(1).toString('hex')}`;
    used.add(id);
    const price = money(row.price);
    return [{
      id,
      name,
      image: text(row.image),
      needed: Math.max(0, Math.round(Number(row.needed) || 0)),
      price: price >= 1 ? price : 1,
      featured: flag(row.featured, false),
    }];
  });
}

export function withCauses(value: unknown): Cause[] {
  if (!Array.isArray(value)) return defaultCauses();
  const used = new Set<string>();
  return value.slice(0, 24).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<Cause>;
    const title = text(row.title);
    if (!title) return [];
    let slug = slugify(text(row.slug) || title);
    while (used.has(slug)) slug = `${slug}-${randomBytes(1).toString('hex')}`;
    used.add(slug);
    const id = text(row.id) || `cause_${randomBytes(3).toString('hex')}`;
    const image = text(row.image);
    const images = Array.isArray(row.images) ? row.images.map((entry) => text(entry)).filter(Boolean).slice(0, 6) : [];
    if (image && !images.includes(image)) images.unshift(image);
    return [{
      id,
      slug,
      title,
      summary: text(row.summary),
      story: text(row.story),
      image: images[0] || image,
      images,
      location: text(row.location),
      organizer: text(row.organizer) || 'Navnikunj Foundation',
      caption: text(row.caption),
      raised: money(row.raised),
      goal: money(row.goal),
      donors: Math.max(0, Math.round(Number(row.donors) || 0)),
      urgent: flag(row.urgent, false),
      taxBenefit: flag(row.taxBenefit, true),
      published: flag(row.published, true),
      products: productsOf(row.products, id),
    }];
  });
}

export function creditCause(causes: Cause[], slug: string, amount: number) {
  if (!slug || !(amount > 0)) return;
  const cause = causes.find((item) => item.slug === slug);
  if (!cause) return;
  cause.raised = Math.round((cause.raised + amount) * 100) / 100;
  cause.donors += 1;
}

export function inr(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}
