import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig, pageMeta } from '@/lib/site-config';

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.line1,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.pincode,
    addressCountry: 'IN',
  },
  sameAs: [
    siteConfig.social.facebook,
    siteConfig.social.instagram,
    siteConfig.social.youtube,
  ],
  logo: `${siteConfig.url}${siteConfig.logo}`,
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

function setJsonLd(data: unknown) {
  let el = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SEOHead() {
  const location = useLocation();
  const path = location.pathname;
  const meta = pageMeta[path] || pageMeta['/'];
  const fullUrl = `${siteConfig.url}${meta.canonical}`;
  const isAdmin = path.startsWith('/admin');

  useEffect(() => {
    document.title = meta.title;
    upsertMeta('name', 'title', meta.title);
    upsertMeta('name', 'description', meta.description);
    if (meta.keywords) {
      upsertMeta('name', 'keywords', meta.keywords);
    }
    upsertLink('canonical', fullUrl);

    if (meta.noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
      upsertMeta('name', 'robots', 'index, follow');
    }

    upsertMeta('property', 'og:type', isAdmin ? 'website' : 'website');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', fullUrl);
    upsertMeta('property', 'og:site_name', siteConfig.name);
    if (meta.ogImage) {
      upsertMeta('property', 'og:image', `${siteConfig.url}${meta.ogImage}`);
    }
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    if (meta.twitterImage) {
      upsertMeta('name', 'twitter:image', `${siteConfig.url}${meta.twitterImage}`);
    }

    const jsonLd = isAdmin ? organizationLd : [organizationLd, websiteLd];
    setJsonLd(jsonLd);
  }, [meta, fullUrl, path, isAdmin]);

  return null;
}
