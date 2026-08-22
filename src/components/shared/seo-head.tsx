import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig, pageMeta, type PageMeta } from '@/lib/site-config';

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  foundingDate: String(siteConfig.established),
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.pincode,
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: siteConfig.coordinates.lat,
    longitude: siteConfig.coordinates.lng,
  },
  hasMap: siteConfig.mapsPlaceUrl,
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
};

/**
 * Resolves metadata for the current path.
 *
 * Anything under /admin (other than the explicitly defined login entry) and any
 * unmatched dynamic route must NOT inherit the homepage's indexable metadata,
 * because that would emit `index, follow` plus a canonical pointing at `/`.
 */
function resolveMeta(path: string): PageMeta {
  const exact = pageMeta[path];
  if (exact) return exact;

  if (path.startsWith('/admin')) {
    return {
      title: 'Admin Portal | Prarthana PU Science College',
      description: 'Restricted administration area.',
      keywords: '',
      canonical: path,
      noindex: true,
    };
  }

  // Announcement detail pages: real, indexable content with a self-canonical URL.
  if (path.startsWith('/announcements/')) {
    return {
      ...pageMeta['/announcements'],
      title: 'Announcement | Prarthana PU Science College Bagalkot',
      description:
        'Read the full official notice from Prarthana PU Science College Bagalkot, including dates, venue and details.',
      canonical: path,
    };
  }

  // Career job detail pages.
  if (path.startsWith('/careers/')) {
    return {
      ...pageMeta['/careers'],
      title: 'Job Opening | Prarthana PU Science College Bagalkot',
      description:
        'View the role description, qualifications and how to apply for this opening at Prarthana PU Science College Bagalkot.',
      canonical: path,
    };
  }

  return pageMeta['*'] || pageMeta['/'];
}

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
  const existing = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (data === null) {
    existing?.remove();
    return;
  }
  let el = existing;
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
  const meta = resolveMeta(path);
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
      upsertMeta('name', 'googlebot', 'noindex, nofollow');
    } else {
      upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
      upsertMeta('name', 'googlebot', 'index, follow, max-image-preview:large');
    }

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', fullUrl);
    upsertMeta('property', 'og:site_name', siteConfig.name);
    upsertMeta('property', 'og:locale', 'en_IN');
    if (meta.ogImage) {
      upsertMeta('property', 'og:image', `${siteConfig.url}${meta.ogImage}`);
      upsertMeta('property', 'og:image:alt', siteConfig.name);
    }
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    if (meta.twitterImage) {
      upsertMeta('name', 'twitter:image', `${siteConfig.url}${meta.twitterImage}`);
    }

    // Never publish organisation/site structured data on restricted admin screens.
    setJsonLd(isAdmin ? null : [organizationLd, websiteLd]);
  }, [meta, fullUrl, path, isAdmin]);

  return null;
}
