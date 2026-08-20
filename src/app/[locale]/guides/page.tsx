import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getGuidesByDomain, getUngroupedGuides} from '@/lib/guides';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import GuideCard from '@/components/GuideCard';
import MedicalNotice from '@/components/MedicalNotice';
import Reveal from '@/components/Reveal';

// Prices come from Stripe, so the page is revalidated rather than frozen at
// build time: a price change in the dashboard appears without a deploy.
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string};
}): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const tSeo = await getTranslations({locale, namespace: 'Seo'});

  return buildMetadata({
    locale,
    title: tSeo('guidesTitle'),
    description: tSeo('guidesDescription'),
    pathname: '/guides'
  });
}

export default async function GuidesPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Guides');
  const grouped = await getGuidesByDomain(locale);
  const ungrouped = await getUngroupedGuides(locale);

  // Domains that exist plus anything not yet assigned to one, so a guide with a
  // missing `domain` is still reachable rather than silently unsold.
  const sections = [
    ...grouped,
    ...(ungrouped.length > 0
      ? [{id: 'other' as const, label: t('other'), guides: ungrouped}]
      : [])
  ];

  const prices = new Map(
    await Promise.all(
      sections
        .flatMap((section) => section.guides)
        .map(
          async (guide) => [guide.slug, await getPrice(guide.priceId)] as const
        )
    )
  );

  return (
    <Container className="max-w-6xl py-24">
      <PageHeader title={t('title')} intro={t('intro')}>
        {/* The promise the whole library rests on: the evidence is never the
            part behind the paywall. Stated where somebody deciding whether to
            buy can see it. */}
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
          {t('researchFree')}
        </p>
      </PageHeader>

      {sections.length === 0 ? (
        <p className="mt-16 text-xl text-black">{t('empty')}</p>
      ) : (
        sections.map((section) => (
          <section key={section.id} className="mt-20">
            <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
              {section.label}
            </h2>

            <div className="mt-10 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {section.guides.map((guide, index) => (
                <Reveal key={guide.slug} delay={Math.min(index * 60, 240)}>
                  <GuideCard
                    guide={guide}
                    price={prices.get(guide.slug) ?? null}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      )}

      <MedicalNotice className="mt-20" />
    </Container>
  );
}
