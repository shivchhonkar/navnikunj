import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpen, Heart, Users } from 'lucide-react';
import { ProgramSlider } from '@/components/ProgramSlider';
import { getSite } from '@/lib/store';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=80';
const ABOUT_PHOTO = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80';

const STORY_PHOTOS = [
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80',
];

const STAT_ICONS = [Users, BookOpen, Heart, BadgeCheck];

function storyDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: value, year: '' };
  return {
    day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    year: String(date.getFullYear()),
  };
}

export default function HomePage() {
  const site = getSite();
  const posts = site.posts.filter((post) => post.published).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const heroImage = site.hero.image || HERO_PHOTO;
  const aboutImage = site.about.image || ABOUT_PHOTO;

  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <img src={heroImage} alt="" className="hero-blur absolute inset-0 h-full w-full object-cover" />
        <div className="hero-wash absolute inset-0" />
        <div className="shell relative flex min-h-[16rem] items-center py-10 md:min-h-[20rem]">
          <div className="max-w-xl">
            <p className="eyebrow">{site.hero.eyebrow}</p>
            <h1 className="heading-xl mt-5 max-w-lg text-ink">{site.hero.title}</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-ink/80 sm:text-lg">{site.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/donate" className="btn btn-brand">
                Support our mission <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="btn btn-line">Learn more</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-line bg-[#FCF2E4]" aria-label="Impact">
        <img src="/images/bg_images/stats_bg.png" alt="" className="pointer-events-none absolute left-1/2 top-0 h-full w-[112%] max-w-none -translate-x-1/2 object-fill" />
        <dl className="relative mx-auto grid w-full max-w-[76rem] grid-cols-2 px-[18%] md:grid-cols-4 md:px-[11%]">
          {site.stats.map((item, index) => {
            const Icon = STAT_ICONS[index % STAT_ICONS.length];
            const rule = index === 0 ? 'hidden' : index % 2 === 0 ? 'hidden md:block' : 'block';
            return (
              <div key={item.label} className={`relative min-w-0 px-1 py-4 text-center md:py-5 ${index >= 2 ? 'max-md:border-t max-md:border-line' : ''}`}>
                <span className={`absolute left-0 top-1/2 h-11 w-px -translate-y-1/2 bg-brand/35 ${rule}`} />
                <Icon className="mx-auto text-brand" size={28} strokeWidth={1.75} aria-hidden />
                <dt className="mt-1.5 text-[1.55rem] leading-none tracking-tight text-ink md:text-[1.7rem]">{item.value}</dt>
                <dd className="mx-auto mt-1 block w-full max-w-[6.5rem] text-[0.8rem] leading-4 text-muted md:max-w-none">{item.label}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="section">
        <div className="shell mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our focus areas</p>
          <div className="mx-auto mt-4 h-px w-12 bg-brand" />
          <h2 className="heading-lg mt-5 text-ink">Where the work goes</h2>
          <p className="lead mt-4">Learning, health, family relief, work skills, and cleaner shared places. Open a program to see what it covers.</p>
        </div>
        <ProgramSlider programs={site.programs} />
        <div className="shell mt-8 text-center">
          <Link href="/programs" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">
            See all programs <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="bg-paper">
        <div className="section shell grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <img src={aboutImage} alt="People gathered for a community program" className="h-80 w-full rounded-card object-cover shadow-card lg:h-[26rem]" />
          <div>
            <p className="eyebrow">About us</p>
            <h2 className="heading-lg mt-4 text-ink">Who We Are</h2>
            <p className="mt-3 text-lg leading-snug text-ink">Working Together for a Better Tomorrow</p>
            <p className="lead mt-4">Navnikunj Foundation is committed to creating positive and lasting change in communities by working with people who need support, opportunities, and a stronger path toward a better future.</p>
            <p className="mt-5 border-l-2 border-brand pl-4 text-base leading-7 text-brandDark">“Empowering Communities • Creating Opportunities • Building a Better Tomorrow”</p>
            <Link href="/about" className="btn btn-line mt-8">
              Our story <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand text-white">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center md:py-14">
          <div className="flex items-center gap-5">
            <img src="/images/logo.svg" alt="" className="hidden h-20 w-auto rounded-xl bg-white object-contain p-1.5 sm:block" />
            <div>
              <h2 className="heading-lg text-white">{site.cta.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base">{site.cta.text}</p>
            </div>
          </div>
          <Link href="/donate" className="btn btn-light shrink-0">
            Donate Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section shell">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Latest updates</p>
            <h2 className="heading-lg mt-3 text-ink">News & Updates</h2>
          </div>
          <Link href="/news" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => {
            const when = storyDate(post.date);
            const photo = post.image || STORY_PHOTOS[index % STORY_PHOTOS.length];
            return (
              <article key={post.id} className="card flex h-full flex-col overflow-hidden border border-line transition-shadow hover:shadow-card">
                <Link href={`/news/${post.slug}`} className="relative block h-52">
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                  <p className="absolute left-4 top-4 rounded-lg bg-paper px-3 py-2 text-center text-xs leading-tight text-brandDark">
                    {when.day}<br />{when.year}
                  </p>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs uppercase tracking-wide text-brand">{post.kind}</p>
                  <h3 className="mt-2 text-lg leading-snug text-ink">
                    <Link href={`/news/${post.slug}`} className="hover:text-brand">{post.title}</Link>
                  </h3>
                  <p className="lead mt-3 line-clamp-3 flex-1 text-sm">{post.excerpt}</p>
                  <Link href={`/news/${post.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">
                    Read more <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
