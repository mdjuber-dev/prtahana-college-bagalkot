import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig, pageMeta } from '@/lib/site-config';

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

export default function SEOHead() {
  const location = useLocation();
  const path = location.pathname;
  const meta = pageMeta[path] || pageMeta['/'];
  const fullUrl = `${siteConfig.url}${meta.canonical}`;

  useEffect(() => {
    document.title = meta.title;
    upsertMeta('name', 'title', meta.title);
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'keywords', meta.keywords);
    upsertLink('canonical', fullUrl);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', fullUrl);
    upsertMeta('property', 'og:site_name', siteConfig.name);
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
  }, [meta, fullUrl, path]);

  return null;
}
