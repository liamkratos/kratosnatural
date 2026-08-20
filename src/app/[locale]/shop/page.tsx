import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getProducts} from '@/lib/products';
import {getGuides} from '@/lib/guides';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import GuideCard from '@/components/GuideCard';
import ScrollRow from '@/components/ScrollRow';
import {Link} from '@/i18n/navigation';
import ProductCard from '@/components/ProductCard';
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
    title: tSeo('shopTitle'),
    description: tSeo('shopDescription'),
    pathname: '/shop'
  });
}

export default async function ShopPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Shop');
  const products = await getProducts(locale);
  const prices = await Promise.all(products.map((p) => getPrice(p.priceId)));

  // A taste of the library, not the library. The row running off the edge is
  // what says there is more, so it is capped rather than showing everything.
  const guides = (await getGuides(locale)).slice(0, 8);
  const guidePrices = await Promise.all(guides.map((g) => getPrice(g.priceId)));

  return (
    <Container className="max-w-6xl py-24">
      <PageHeader title={t('title')} intro={t('intro')} />

      {/* Guides live under the shop, so the shop shows them rather than
          describing them. Real cards, scrolling sideways, because a grid of
          everything would make the guides compete with the products for the
          page instead of sitting under them. */}
      <Card className="mt-6">
        {/* Stacked and centred on a phone, where `justify-between` wrapped the
            two onto separate lines and left-aligned them against a card whose
            every other line is centred. Side by side from sm up. */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
            {t('guidesTitle')}
          </h2>
          <Link
            href="/guides"
            className="font-display text-base uppercase leading-none text-olive underline underline-offset-4 transition-colors duration-200 hover:text-oliveSoft"
          >
            {t('guidesCta')}
          </Link>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
          {t('guidesBody')}
        </p>

        {guides.length > 0 ? (
          <ScrollRow label={t('guidesTitle')} className="mt-8">
            {guides.map((guide, index) => (
              <GuideCard
                key={guide.slug}
                guide={guide}
                price={guidePrices[index] ?? null}
              />
            ))}
          </ScrollRow>
        ) : (
          <Link
            href="/guides"
            className="mt-6 inline-block rounded-[20px] bg-olive px-7 py-4 font-display text-lg uppercase leading-none text-white transition-colors duration-200 hover:bg-oliveSoft"
          >
            {t('guidesCta')}
          </Link>
        )}
      </Card>

      {products.length === 0 ? (
        <p className="mt-16 text-xl text-black">{t('empty')}</p>
      ) : (
        <div className="mt-16 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.slug} delay={index * 60}>
              <ProductCard product={product} price={prices[index]} />
            </Reveal>
          ))}
        </div>
      )}
    </Container>
  );
}
