import type { Metadata } from 'next';
import {
  Accessibility,
  Baby,
  Droplet,
  Eye,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Leaf,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Trophy,
  Users,
  Utensils,
  Wheat,
  Wrench,
} from 'lucide-react';
import { getSite } from '@/lib/store';
import type { LucideIcon } from 'lucide-react';

const BANNER_PHOTO = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=2000&q=80';
const STORY_PHOTO = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80';

const AREAS: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Education & Literacy', text: 'Supporting quality education, scholarships, literacy initiatives, and learning opportunities for children and communities.', icon: GraduationCap },
  { title: 'Healthcare & Medical Assistance', text: 'Promoting healthcare awareness and supporting medical assistance, health camps, and community wellness initiatives.', icon: HeartPulse },
  { title: 'Women Empowerment', text: 'Creating opportunities for women through skill development, livelihood support, entrepreneurship, and social awareness.', icon: Users },
  { title: 'Child Welfare & Development', text: 'Supporting children\u2019s education, nutrition, safety, and overall physical, emotional, and social development.', icon: Baby },
  { title: 'Skill Development & Vocational Training', text: 'Providing vocational training, practical skills, entrepreneurship support, and opportunities that can contribute to sustainable livelihoods.', icon: Wrench },
  { title: 'Poverty Alleviation', text: 'Supporting economically vulnerable families and communities through assistance, livelihood opportunities, and community development initiatives.', icon: HandHeart },
  { title: 'Food & Nutrition Support', text: 'Helping underprivileged communities access nutritious food and promoting awareness about healthy living and nutrition.', icon: Utensils },
  { title: 'Environmental Protection & Plantation', text: 'Promoting plantation, environmental conservation, cleanliness, sustainability, and awareness for a healthier environment.', icon: Sprout },
  { title: 'Agriculture & Farmer Welfare', text: 'Supporting farmers and rural communities through agriculture-related initiatives, awareness, and opportunities for sustainable development.', icon: Wheat },
  { title: 'Senior Citizen Welfare', text: 'Promoting dignity, care, social inclusion, and support for senior citizens and their families.', icon: Heart },
  { title: 'Disability Support & Rehabilitation', text: 'Working toward greater inclusion, accessibility, dignity, and opportunities for persons with disabilities.', icon: Accessibility },
  { title: 'Youth Development & Sports', text: 'Encouraging young people through education, skills, sports, leadership, and opportunities for personal development.', icon: Trophy },
  { title: 'Animal Welfare', text: 'Supporting the protection, care, and welfare of animals while promoting compassion and responsible community participation.', icon: PawPrint },
  { title: 'Cleanliness & Hygiene Awareness', text: 'Promoting cleanliness, sanitation, personal hygiene, and healthy community practices through awareness initiatives.', icon: Sparkles },
  { title: 'Blood Donation & Health Awareness', text: 'Encouraging blood donation and conducting health and wellness awareness campaigns that help communities make informed health decisions.', icon: Droplet },
];

const VALUES: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Integrity', text: 'We believe in transparency, responsible action, and using every contribution where it can create meaningful impact.', icon: ShieldCheck },
  { title: 'Compassion', text: 'We care about people, listen to their needs, and work to support communities with dignity and empathy.', icon: Heart },
  { title: 'Inclusivity', text: 'Everyone deserves an opportunity to learn, grow, participate, and live with dignity.', icon: Users },
  { title: 'Stewardship', text: 'We believe resources, communities, and the environment should be protected and developed responsibly for future generations.', icon: Sprout },
];

export const metadata: Metadata = {
  title: 'About us',
  description: 'Navnikunj Foundation works with communities on education, healthcare, livelihoods, and humanitarian support.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const site = getSite();
  const storyImage = site.about.image || STORY_PHOTO;

  return (
    <main>
      <section className="relative isolate overflow-hidden text-white">
        <img src={BANNER_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover object-left" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/15 via-ink/45 to-ink/75" />
        <div className="shell relative flex min-h-[13rem] items-center py-12 md:min-h-[17rem] md:justify-end">
          <div className="max-w-lg md:text-right">
            <h1 className="heading-xl">About Us</h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">Together for a Better Tomorrow</p>
          </div>
        </div>
      </section>

      <section className="section shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <h2 className="heading-lg text-brand">Who We Are</h2>
          <p className="mt-3 text-lg leading-snug text-ink">Working Together for a Better Tomorrow</p>
          <p className="lead mt-5">Navnikunj Foundation is committed to creating positive and lasting change in communities by working with people who need support, opportunities, and a stronger path toward a better future.</p>
          <p className="lead mt-4">Our work focuses on education, healthcare, women and child welfare, livelihood development, environmental protection, food and nutrition, and humanitarian support. We believe meaningful change begins at the community level—by listening to people&apos;s needs, creating opportunities, and supporting individuals and families with dignity.</p>
          <p className="lead mt-4">Through the involvement of volunteers, community members, supporters, and partners, we work to make essential resources and opportunities more accessible to those who need them most.</p>
          <p className="mt-6 border-l-2 border-brand pl-4 text-base leading-7 text-brandDark">“Empowering Communities • Creating Opportunities • Building a Better Tomorrow”</p>
        </div>
        <img src={storyImage} alt="People gathered for a community program" className="h-80 w-full rounded-card object-cover shadow-card lg:h-full lg:max-h-[36rem]" />
      </section>

      <section className="section bg-paper">
        <div className="shell mx-auto max-w-3xl text-center">
          <h2 className="heading-lg text-ink">Our Areas of Work</h2>
          <p className="mt-3 text-lg leading-snug text-brand">Creating Impact Where It Matters Most</p>
          <p className="lead mt-4">Navnikunj Foundation works across multiple areas of community development. Our initiatives are designed to address essential needs while creating opportunities for individuals and communities to become more self-reliant and resilient.</p>
        </div>
        <div className="shell mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {AREAS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="card flex gap-4 border border-line p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base leading-snug text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-lg text-ink">Our Core Values</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="card border border-line px-5 py-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-base text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell grid gap-5 pb-[var(--space-section)] md:grid-cols-2">
        <article className="rounded-card bg-sand px-6 py-7 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-brand">
              <Eye size={18} />
            </span>
            <h2 className="text-lg text-brand">Our Vision</h2>
          </div>
          <p className="mt-4 text-base leading-snug text-ink">A More Empowered and Compassionate Society</p>
          <p className="lead mt-3 text-sm">To build an empowered, compassionate, and sustainable society where every individual has the opportunity to grow, contribute, and live with dignity.</p>
        </article>
        <article className="rounded-card bg-sand px-6 py-7 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-brand">
              <Target size={18} />
            </span>
            <h2 className="text-lg text-brand">Our Mission</h2>
          </div>
          <p className="mt-4 text-base leading-snug text-ink">Turning Support Into Meaningful Change</p>
          <p className="lead mt-3 text-sm">To serve communities through education, healthcare, empowerment, environmental responsibility, livelihood development, and humanitarian initiatives that create meaningful and lasting social impact.</p>
        </article>
      </section>

      <section className="bg-sand">
        <div className="section shell mx-auto max-w-3xl text-center">
          <h2 className="heading-lg text-brand">Our Commitment</h2>
          <p className="mt-3 text-lg leading-snug text-ink">Small Actions. Meaningful Change.</p>
          <p className="lead mt-5">At Navnikunj Foundation, we believe that lasting social change is created when people, communities, volunteers, and supporters come together with a shared purpose.</p>
          <p className="lead mt-4">Whether it is helping a child continue their education, supporting a family during a difficult time, empowering a woman with skills, caring for the environment, or standing beside communities during emergencies, every effort can contribute to a better tomorrow.</p>
          <p className="mt-8 text-lg text-brand">Together for a Better Tomorrow.</p>
        </div>
      </section>

      <section className="shell flex items-center justify-center gap-4 py-10 text-center sm:gap-6">
        <Leaf className="shrink-0 text-brand" size={22} aria-hidden />
        <p className="text-lg uppercase tracking-[0.16em] text-brand">{site.identity.name}</p>
        <Leaf className="shrink-0 text-brand" size={22} aria-hidden />
      </section>
    </main>
  );
}
