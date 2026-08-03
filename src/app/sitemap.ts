import type {MetadataRoute} from 'next';
import {locales, localeDomains, type Locale} from '@/i18n/routing';
import {getArticles} from '@/lib/mdx';
import {getProducts} from '@/lib/products';
import {policySlugs} from '@/lib/policies';

/**
 * Sitemap, generated from the content rather than maintained by hand, so a new
 * article or product is listed the moment it is added.
 *
 * Each entry carries `alternates.languages`, which is how a search engine is
 * told that kratosnatural.com/articles and kratosnatural.nl/artikelen are the
 * same page in two languages rather than two pages competing with each other.
 * The domains serve one locale each, so a URL only ever appears under its own
 * domain and there is nothing to deduplicate.
 *
 * Account pages are deliberately absent: they are behind a sign-in and have
 * nothing to offer a search engine. So is the checkout confirmation, which
 * should never be reachable except after paying.
 */
const CHANGE: Record<string, MetadataRoute.Sitemap[number]['changeFrequency']> =
  {
    home: 'weekly',
    listing: 'weekly',
    article: 'monthly',
    product: 'monthly',
    static: 'yearly'
  };

function url(locale: Locale, pathname: string) {
  return `${localeDomains[locale]}${pathname === '/' ? '' : pathname}`;
}

/** The same page in every language, for the hreflang block on each entry. */
function languagesFor(paths: Partial<Record<Locale, string>>) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const path = paths[locale];
    if (path) languages[locale] = url(locale, path);
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // Pages that exist at the same path in both languages.
  const shared = [
    {path: '/', priority: 1, frequency: CHANGE.home},
    {path: '/shop', priority: 0.9, frequency: CHANGE.listing},
    {path: '/articles', priority: 0.9, frequency: CHANGE.listing},
    {path: '/about', priority: 0.6, frequency: CHANGE.static},
    ...policySlugs.map((slug) => ({
      path: `/${slug}`,
      priority: 0.3,
      frequency: CHANGE.static
    }))
  ];

  for (const {path, priority, frequency} of shared) {
    const languages = languagesFor(
      Object.fromEntries(locales.map((l) => [l, path])) as Record<Locale, string>
    );
    for (const locale of locales) {
      entries.push({
        url: url(locale, path),
        lastModified: now,
        changeFrequency: frequency,
        priority,
        alternates: {languages}
      });
    }
  }

  // Articles and products have their own slug per language, so each entry's
  // hreflang block is built from the slugs that actually exist. A piece that
  // has not been translated yet simply lists one language rather than pointing
  // at a URL that would 404.
  const byLocale = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      articles: await getArticles(locale),
      products: await getProducts(locale)
    }))
  );

  for (const {locale, articles, products} of byLocale) {
    for (const article of articles) {
      entries.push({
        url: url(locale, `/articles/${article.slug}`),
        lastModified: new Date(article.updatedDate ?? article.publishDate),
        changeFrequency: CHANGE.article,
        priority: 0.8
      });
    }
    for (const product of products) {
      entries.push({
        url: url(locale, `/shop/${product.slug}`),
        lastModified: now,
        changeFrequency: CHANGE.product,
        priority: 0.8
      });
    }
  }

  return entries;
}
