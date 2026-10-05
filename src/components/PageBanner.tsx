import { bannerPosition } from '@/lib/banners';
import type { PageBanner as Banner } from '@/lib/banners';

export function PageBanner({ banner }: { banner: Banner }) {
  const team = banner.slug === 'team';
  return (
    <section className="relative isolate overflow-hidden text-white">
      <img src={banner.image} alt="" className={`absolute inset-0 h-full w-full ${bannerPosition(banner.slug)}`} />
      {team ? (
        <>
          <img src={banner.image} alt="" className={`hero-blur-right absolute inset-0 h-full w-full ${bannerPosition(banner.slug)}`} />
          <div className="hero-wash-right absolute inset-0" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-ink/15 via-ink/45 to-ink/75" />
      )}
      <div className={`shell relative flex items-center md:justify-end ${team ? 'min-h-[9.5rem] py-6 md:min-h-[11rem]' : 'min-h-[13rem] py-12 md:min-h-[17rem]'}`}>
        <div className="max-w-lg md:text-right">
          <h1 className="heading-xl">{banner.title}</h1>
          {banner.text ? <p className="mt-3 text-base text-white/90 sm:text-lg">{banner.text}</p> : null}
        </div>
      </div>
    </section>
  );
}
