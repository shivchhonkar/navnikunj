import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { PostCard, formatPostDate, postPhoto } from '@/components/PostCard';
import { ShareLinks } from '@/components/ShareLinks';
import { getSite, siteUrl } from '@/lib/store';
import type { Post } from '@/lib/types';

type Params = { params: { slug: string } };

const KIND_LABEL = { news: 'News', blog: 'Blog', event: 'Event' };

function publishedPost(slug: string) {
  return getSite().posts.find((item) => item.slug === slug && item.published);
}

function articleJsonLd(post: Post, pageUrl: string, image: string, publisher: string) {
  const shared = {
    '@context': 'https://schema.org',
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    image: [image],
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: pageUrl,
    author: { '@type': 'Organization', name: publisher },
    publisher: {
      '@type': 'Organization',
      name: publisher,
      logo: { '@type': 'ImageObject', url: `${siteUrl()}/images/logo.svg` },
    },
  };
  if (post.kind === 'event') {
    return {
      ...shared,
      '@type': 'Event',
      startDate: post.date,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'Place', name: post.location || publisher },
      organizer: { '@type': 'Organization', name: publisher, url: siteUrl() },
    };
  }
  return {
    ...shared,
    '@type': post.kind === 'blog' ? 'BlogPosting' : 'NewsArticle',
    articleSection: KIND_LABEL[post.kind],
  };
}

export function generateMetadata({ params }: Params): Metadata {
  const post = publishedPost(params.slug);
  if (!post) return { title: 'Update' };
  const site = getSite();
  const pageUrl = `${siteUrl()}/news/${post.slug}`;
  const image = postPhoto(post);
  return {
    title: post.title,
    description: post.excerpt,
    keywords: (post.keywords || '').split(',').map((word) => word.trim()).filter(Boolean),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: [{ url: image, alt: post.title }],
      siteName: site.identity.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
  };
}

export default function NewsArticle({ params }: Params) {
  const site = getSite();
  const post = publishedPost(params.slug);
  if (!post) notFound();

  const pageUrl = `${siteUrl()}/news/${post.slug}`;
  const image = postPhoto(post);
  const related = site.posts
    .filter((item) => item.published && item.id !== post.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const jsonLd = articleJsonLd(post, pageUrl, image, site.identity.name);
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl() },
      { '@type': 'ListItem', position: 2, name: 'News & Updates', item: `${siteUrl()}/news` },
      { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="relative isolate overflow-hidden text-white">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/20 via-ink/50 to-ink/78" />
        <div className="shell relative flex min-h-[14rem] items-end py-12 md:min-h-[18rem] md:items-center md:justify-end">
          <div className="max-w-xl md:text-right">
            <p className="text-sm uppercase tracking-[0.18em] text-white/80">{KIND_LABEL[post.kind]}</p>
            <h1 className="heading-xl mt-3">{post.title}</h1>
            <p className="mt-3 text-sm text-white/90 sm:text-base">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              {post.location ? ` · ${post.location}` : ''}
            </p>
          </div>
        </div>
      </section>

      <article className="section shell max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/news" className="hover:text-brand">News & Updates</Link>
          <span aria-hidden> / </span>
          <span className="text-ink">{post.title}</span>
        </nav>

        <p className="lead mt-8 text-lg">{post.excerpt}</p>
        {post.location ? (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink">
            <MapPin size={15} className="text-brand" /> {post.location}
          </p>
        ) : null}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink">{post.body}</div>

        <div className="mt-10 border-t border-line pt-8">
          <ShareLinks url={pageUrl} title={post.title} text={post.excerpt} />
        </div>
      </article>

      {related.length ? (
        <section className="section shell border-t border-line pt-0">
          <h2 className="heading-lg text-ink">More updates</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((item) => <PostCard key={item.id} post={item} />)}
          </div>
        </section>
      ) : null}
    </main>
  );
}
