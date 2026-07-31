import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'nl'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Domain-based routing.
 *
 * kratosnatural.com serves English, kratosnatural.nl serves Dutch. Because each
 * domain lists exactly one locale, the middleware never prefixes the pathname on
 * production domains: kratosnatural.nl/articles stays prefix-free while still
 * resolving to the `nl` segment internally.
 *
 * The `www` hosts are listed too, because the match is on the exact Host header.
 * Vercel serves `www` as the production domain, so without these entries no
 * domain matched and every request fell through to the default locale — which
 * silently served the Dutch site in English while looking entirely healthy.
 *
 * On any other host (localhost, Vercel preview URLs) the domain list does not
 * match, so routing falls back to prefixes: /en/... and /nl/....
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
  domains: [
    {
      domain: 'kratosnatural.com',
      defaultLocale: 'en',
      locales: ['en']
    },
    {
      domain: 'www.kratosnatural.com',
      defaultLocale: 'en',
      locales: ['en']
    },
    {
      domain: 'kratosnatural.nl',
      defaultLocale: 'nl',
      locales: ['nl']
    },
    {
      domain: 'www.kratosnatural.nl',
      defaultLocale: 'nl',
      locales: ['nl']
    }
  ]
});

/** Canonical origin per locale, used by the SEO helpers. */
export const localeDomains: Record<Locale, string> = {
  en: process.env.NEXT_PUBLIC_SITE_URL_EN ?? 'https://kratosnatural.com',
  nl: process.env.NEXT_PUBLIC_SITE_URL_NL ?? 'https://kratosnatural.nl'
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
