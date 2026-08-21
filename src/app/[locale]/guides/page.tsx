import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getGuidesByCategory, getUngroupedGuides} from '@/lib/guides';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
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
  const categories = await getGuidesByCategory(locale);
  const ungrouped = await getUngroupedGuides(locale);

  const prices = new Map(
    await Promise.all(
      [
        ...categories.flatMap((c) => c.domains.flatMap((d) => d.guides)),
        ...ungrouped
      ].map(
        async (guide) => [guide.slug, await getPrice(guide.priceId)] as const
      )
    )
  );

  const nothing = categories.length === 0 && ungrouped.length === 0;

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

      {nothing && <p className="mt-16 text-xl text-black">{t('empty')}</p>}

      {/* Two levels: a reader browses at the category and buys at the domain.
          Body says they are in the right half of the library; Houding says
          they are on the right shelf. */}
      {categories.map((category) => (
        <section key={category.id} className="mt-24 first:mt-16">
          <h2
            className="quoted text-balance font-display font-bold uppercase leading-tight"
            style={{fontSize: 'clamp(2.25rem, 7vw, 4.5rem)'}}
          >
            {t(`cat_${category.id}`)}
          </h2>

          {category.domains.map((domain) => (
            <div key={domain.id} className="mt-14">
              <h3 className="font-mono text-xs uppercase tracking-widest text-olive">
                {t(`dom_${domain.id}`)}
              </h3>

              <div className="mt-6 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {domain.guides.map((guide, index) => (
                  <Reveal key={guide.slug} delay={Math.min(index * 60, 240)}>
                    <GuideCard
                      guide={guide}
                      price={prices.get(guide.slug) ?? null}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      {/* Nothing is hidden by forgetting a domain. */}
      {ungrouped.length > 0 && (
        <section className="mt-24">
          <h2
            className="quoted text-balance font-display font-bold uppercase leading-tight"
            style={{fontSize: 'clamp(2.25rem, 7vw, 4.5rem)'}}
          >
            {t('other')}
          </h2>
          <div className="mt-14 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {ungrouped.map((guide, index) => (
              <Reveal key={guide.slug} delay={Math.min(index * 60, 240)}>
                <GuideCard
                  guide={guide}
                  price={prices.get(guide.slug) ?? null}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <MedicalNotice className="mt-24" />
    </Container>
  );
}
