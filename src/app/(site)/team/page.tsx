import type { Metadata } from 'next';
import { ImageIcon } from 'lucide-react';
import { PageBanner } from '@/components/PageBanner';
import { pencil } from '@/fonts/pencil';
import { bannerFor } from '@/lib/banners';
import { getSite } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Our team',
  description: 'Messages from Ashu Sharma, Co-Founder and Chief Executive Officer, and Samrit Roy, Founder and Chairman of Navnikunj Foundation.',
  alternates: { canonical: '/team' },
};

const CEO = {
  heading: 'Message from the CEO',
  greeting: 'Dear Friends and Supporters,',
  paragraphs: [
    'It is with great pride and gratitude that I welcome you to Navnikunj Foundation.',
    'Our foundation was established with a simple belief: that every individual deserves the opportunity to live a life of dignity, hope, and purpose. Across our communities, we see countless people facing challenges such as poverty, hunger, limited access to healthcare, lack of educational opportunities, and social exclusion. While these challenges are significant, we also see something equally powerful — the strength, resilience, and determination of the human spirit.',
    'At Navnikunj Foundation, we are committed to transforming compassion into action. Through our initiatives in poverty alleviation, healthcare, nutrition, education, skill development, environmental sustainability, disaster relief, and social welfare, we strive to create opportunities that empower individuals and strengthen communities.',
    'Our vision extends beyond providing immediate assistance. We aim to build a future where children can dream without limitations, families can access essential resources, senior citizens can live with dignity, and every individual can realize their full potential. We believe that sustainable change is achieved when communities are empowered, supported, and equipped with the tools they need to succeed.',
    'The progress we make is possible because of the trust and support of our donors, volunteers, partners, and well-wishers. Your encouragement inspires us to continue our work with dedication, integrity, and transparency. Together, we are not only addressing present challenges but also laying the foundation for a brighter and more inclusive tomorrow.',
    'As we move forward, we remain committed to creating meaningful and lasting impact. I invite you to join us in this journey of service and social transformation. Every helping hand, every contribution, and every act of kindness brings us closer to a society where no one is left behind.',
    'Thank you for believing in our mission and for being an important part of the Navnikunj Foundation family.',
  ],
  closing: 'With sincere appreciation and warm regards,',
  name: 'Ashu Sharma',
  role: 'Co-Founder & Chief Executive Officer',
  quote: 'True change begins when compassion is transformed into action. Together, let us create opportunities, inspire hope, and build a future where every life can flourish.',
  image: '/images/team/ashu.jpeg',
};

const CHAIRMAN = {
  heading: 'Message from the Chairman',
  greeting: 'Dear Friends,',
  paragraphs: [
    'Every meaningful journey begins with a simple act of compassion. For me, the inspiration behind Navnikunj Foundation came from witnessing the struggles of people around us — families facing hardship, children deprived of opportunities, elderly individuals needing care, and communities striving for a better life. These experiences touched my heart and strengthened my belief that even small acts of kindness can create extraordinary change.',
    'Navnikunj Foundation was established with a dream: a dream of building a society where no one feels forgotten, where every child has the opportunity to learn, every family has access to basic necessities, every patient can receive timely care, and every individual can live with dignity and hope.',
    'Our work in poverty alleviation, healthcare, nutrition, education, skill development, environmental conservation, and community welfare is not just about providing assistance. It is about restoring confidence, creating opportunities, and helping people discover their own strength. Every smile we witness, every life we touch, and every challenge we overcome together reminds us why this mission is so important.',
    'I firmly believe that humanity grows stronger when we stand beside one another during difficult times. Real change is not created by one person or one organization alone. It is built through the collective efforts of volunteers, supporters, donors, partners, and community members who share a common desire to make a difference.',
    'As we continue this journey, our commitment remains unwavering. We will continue to serve with honesty, compassion, and dedication, ensuring that our work reaches those who need it most. Every contribution, whether big or small, becomes a source of hope for someone waiting for a brighter tomorrow.',
    'I extend my heartfelt gratitude to everyone who supports and believes in our vision. Your trust inspires us to work harder and dream bigger. Together, let us create a future where kindness becomes a way of life, opportunities reach every corner of society, and no one is left behind.',
    'Thank you for being a part of the Navnikunj Foundation family.',
  ],
  closing: 'With gratitude and warm regards,',
  name: 'Samrit Roy',
  role: 'Founder & Chairman',
  quote: 'Together, we nurture hope, empower lives, and build a brighter tomorrow.',
  image: '/images/team/sam.jpeg',
};

function Letter({ message, imageSide = 'right', tall = false }: { message: typeof CEO; imageSide?: 'left' | 'right'; tall?: boolean }) {
  const imageOnLeft = imageSide === 'left';
  const frame = tall ? 'h-[28rem] object-top lg:h-[42rem]' : 'h-80 object-center lg:h-[32rem]';
  return (
    <article className={`grid items-start gap-10 lg:gap-14 ${imageOnLeft ? 'lg:grid-cols-[0.95fr_1.05fr]' : 'lg:grid-cols-[1.05fr_0.95fr]'}`}>
      <div className={imageOnLeft ? 'lg:order-2' : undefined}>
        <p className="eyebrow">Leadership</p>
        <h2 className="heading-lg mt-3 text-ink">{message.heading}</h2>
        <p className="mt-2 text-sm text-muted">{message.name}, {message.role}</p>
        <div className={`${pencil.className} mt-6 space-y-4 text-[1.35rem] leading-9 text-[#3d3834]`}>
          <p>{message.greeting}</p>
          {message.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="pt-2">{message.closing}</p>
          <p className="pt-2 text-[1.6rem] leading-8 text-ink">{message.name}</p>
        </div>
        <p className="mt-2 text-sm text-muted">{message.role}</p>
        <p className="text-sm text-muted">Navnikunj Foundation</p>
        <blockquote className={`${pencil.className} mt-6 border-l-2 border-brand pl-4 text-[1.35rem] leading-8 text-brandDark`}>
          “{message.quote}”
        </blockquote>
      </div>
      {message.image ? (
        <img src={message.image} alt={message.name} className={`${frame} w-full rounded-card object-cover shadow-card lg:sticky lg:top-28 ${imageOnLeft ? 'lg:order-1' : ''}`} />
      ) : (
        <div className={`flex h-80 w-full flex-col items-center justify-center gap-3 rounded-card bg-sand text-muted shadow-card lg:sticky lg:top-28 lg:h-[32rem] ${imageOnLeft ? 'lg:order-1' : ''}`} role="img" aria-label={`Photo of ${message.name}`}>
          <ImageIcon size={28} strokeWidth={1.5} aria-hidden />
          <span className="text-sm">Photo</span>
        </div>
      )}
    </article>
  );
}

export default async function TeamPage() {
  const site = await getSite();
  return (
    <main>
      <PageBanner banner={bannerFor(site.banners, 'team')} />
      <section className="section bg-paper">
        <div className="shell">
          <Letter message={CHAIRMAN} imageSide="left" />
        </div>
      </section>
      <section className="section bg-cream">
        <div className="shell">
          <Letter message={CEO} tall />
        </div>
      </section>
    </main>
  );
}
