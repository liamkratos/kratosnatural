import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {defaultLocale, localeDomains, locales} from '@/i18n/routing';

/** Absolute URL for a path on the domain that serves `locale`. */
export function absoluteUrl(locale: Locale, pathname = '/'): string {
  const origin = localeDomains[locale].replace(/\/$/, '');
  const suffix = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${suffix === '/' ? '' : suffix}` || origin;
}

/**
 * hreflang map for a page that exists on every domain under the same pathname.
 * Pass a per-locale pathname map when the slugs differ between languages.
 */
export function alternateLanguages(
  pathnames: Partial<Record<Locale, string>> | string = '/'
): Record<string, string> {
  const resolve = (locale: Locale) =>
    typeof pathnames === 'string' ? pathnames : (pathnames[locale] ?? '/');

  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(locale, resolve(locale));
  }
  languages['x-default'] = absoluteUrl(defaultLocale, resolve(defaultLocale));
  return languages;
}

type BuildMetadataOptions = {
  locale: Locale;
  title: string;
  description: string;
  /** Pathname on the current locale's domain, e.g. "/articles/magnesium". */
  pathname?: string;
  /** Per-locale pathnames when slugs differ; defaults to `pathname`. */
  alternates?: Partial<Record<Locale, string>>;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

/** Canonical + hreflang + Open Graph metadata for a page. */
export function buildMetadata({
  locale,
  title,
  description,
  pathname = '/',
  alternates,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex = false
}: BuildMetadataOptions): Metadata {
  const canonical = absoluteUrl(locale, pathname);
  const ogImage = image ? new URL(image, absoluteUrl(locale)).toString() : undefined;

  return {
    title,
    description,
    metadataBase: new URL(absoluteUrl(locale)),
    alternates: {
      canonical,
      languages: alternateLanguages(alternates ?? pathname)
    },
    robots: noIndex ? {index: false, follow: false} : undefined,
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: 'Kratos Natural',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      images: ogImage ? [{url: ogImage}] : undefined,
      publishedTime,
      modifiedTime
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined
    }
  };
}
