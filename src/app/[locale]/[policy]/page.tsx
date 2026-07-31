import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, locales} from '@/i18n/routing';
import {getPolicy, policySlugs} from '@/lib/policies';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Card from '@/components/Card';

type PageParams = {params: {locale: string; policy: string}};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    policySlugs.map((policy) => ({locale, policy}))
  );
}

export async function generateMetadata({
  params: {locale, policy}
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const doc = await getPolicy(policy);
  if (!doc) return {};

  return buildMetadata({
    locale,
    title: doc.title,
    description: doc.title,
    pathname: `/${policy}`,
    // Legal pages carry no search value, and the identical text on both domains
    // would otherwise compete with itself.
    noIndex: true
  });
}

export default async function PolicyPage({
  params: {locale, policy}
}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const doc = await getPolicy(policy);
  if (!doc) notFound();

  const t = await getTranslations('Policies');

  return (
    <Container className="max-w-3xl py-24">
      <Card>
        <h1 className="font-display text-5xl font-bold uppercase leading-tight">
          {doc.title}
        </h1>
        {/* The source documents are Dutch and are served as-is on both
            domains. An unreviewed translation of a privacy policy or terms of
            service would be worse than none, so English readers are told
            plainly which text is authoritative rather than being handed Dutch
            with no explanation. */}
        {locale === 'en' && (
          <p
            lang="en"
            className="mt-6 text-left font-mono text-xs uppercase leading-relaxed tracking-widest text-black"
          >
            {t('dutchNotice')}
          </p>
        )}

        {/* Rendered as plain paragraphs, left-aligned for readability the same
            way article prose is. */}
        <div lang="nl" className="mt-10 space-y-5 text-left">
          {doc.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-black">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>
    </Container>
  );
}
