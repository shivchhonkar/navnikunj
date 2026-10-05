import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpen, Heart, Users } from 'lucide-react';
import { HeroBanner } from '@/components/HeroBanner';
import { ProgramSlider } from '@/components/ProgramSlider';
import { getSite } from '@/lib/store';

const ABOUT_PHOTO = '/images/banner_images/banner-poor-childrens.jpeg';

const STORY_PHOTOS = [
  '/images/banner_images/banner-smile-face.jpeg',
  '/images/banner_images/banner-education.jpeg',
  '/images/banner_images/banner-poor-childrens.jpeg',
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

export default async function HomePage() {
  const site = await getSite();
  const posts = site.posts.filter((post) => post.published).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const home = site.home;
  const aboutImage = home.about.image || site.about.image || ABOUT_PHOTO;

  return (
    <main>
      <HeroBanner eyebrow={site.hero.eyebrow} slides={site.hero.slides} />

      {home.stats.visible && site.stats.length ? (
      <section className="relative overflow-hidden border-b border-line bg-[#FCF2E4]" aria-label="Impact">
        <img src={home.stats.image || '/images/bg_images/stats_bg.png'} alt="" className="pointer-events-none absolute left-1/2 top-0 h-full w-[112%] max-w-none -translate-x-1/2 object-fill" />
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
      ) : null}

      {home.work.visible ? (
      <section className="section">
        <div className="shell mx-auto max-w-2xl text-center">
          {home.work.eyebrow ? <p className="eyebrow">{home.work.eyebrow}</p> : null}
          <div className="mx-auto mt-4 h-px w-12 bg-brand" />
          <h2 className="heading-lg mt-5 text-ink">{home.work.title}</h2>
          {home.work.text ? <p className="lead mt-4">{home.work.text}</p> : null}
        </div>
        <ProgramSlider programs={site.programs} linkLabel={home.work.cardLabel} />
        {home.work.linkLabel ? (
          <div className="shell mt-8 text-center">
            <Link href="/programs" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">
              {home.work.linkLabel} <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}
      </section>
      ) : null}

      {home.about.visible ? (
      <section className="bg-paper">
        <div className="section shell grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <img src={aboutImage} alt="" className="h-80 w-full rounded-card object-cover shadow-card lg:h-[26rem]" />
          <div>
            {home.about.eyebrow ? <p className="eyebrow">{home.about.eyebrow}</p> : null}
            <h2 className="heading-lg mt-4 text-ink">{home.about.title}</h2>
            {home.about.text ? <p className="lead mt-4">{home.about.text}</p> : null}
            {home.about.detail ? <p className="lead mt-4">{home.about.detail}</p> : null}
            {home.about.quote ? <p className="mt-5 border-l-2 border-brand pl-4 text-base leading-7 text-brandDark">{home.about.quote}</p> : null}
            {home.about.linkLabel ? (
              <Link href="/about" className="btn btn-line mt-8">
                {home.about.linkLabel} <ArrowRight size={15} />
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      ) : null}

      {home.donation.visible ? (
      <section className="bg-brand text-white">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center md:py-14">
          <div className="flex items-center gap-5">
            {home.donation.image ? <img src={home.donation.image} alt="" className="hidden h-20 w-auto object-contain sm:block" /> : null}
            <div>
              <h2 className="heading-lg text-white">{site.cta.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base">{site.cta.text}</p>
            </div>
          </div>
          {home.donation.buttonLabel ? (
            <Link href="/donate" className="btn btn-light shrink-0">
              {home.donation.buttonLabel} <ArrowRight size={16} />
            </Link>
          ) : null}
        </div>
      </section>
      ) : null}

      {home.news.visible ? (
      <section className="section shell">
        <div className="flex items-end justify-between gap-4">
          <div>
            {home.news.eyebrow ? <p className="eyebrow">{home.news.eyebrow}</p> : null}
            <h2 className="heading-lg mt-3 text-ink">{home.news.title}</h2>
          </div>
          {home.news.linkLabel ? <Link href="/news" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brandDark">{home.news.linkLabel} <ArrowRight size={14} /></Link> : null}
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
      ) : null}
    </main>
  );
}
