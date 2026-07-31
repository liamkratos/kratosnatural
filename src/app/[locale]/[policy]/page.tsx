import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
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

  return (
    <Container className="max-w-3xl py-24">
      <Card>
        <h1 className="font-display text-5xl font-bold uppercase leading-tight">
          {doc.title}
        </h1>
        {/* Rendered as plain paragraphs, left-aligned for readability the same
            way article prose is. */}
        <div className="mt-10 space-y-5 text-left">
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
