import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getProductsByCategory} from '@/lib/products';
import {getGuides} from '@/lib/guides';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import GuideCard from '@/components/GuideCard';
import CollectionSection from '@/components/CollectionSection';

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
  const tGuides = await getTranslations('Guides');

  const {grouped, uncategorised} = await getProductsByCategory(locale);
  const guides = (await getGuides(locale)).slice(0, 8);

  /*
   * Every price on the page in one pass.
   *
   * `getPrice` is cached per price id, so the repeated ids across categories
   * cost one Stripe call each rather than one per card — but the lookups still
   * have to be resolved before render, and doing it per section would serialise
   * them.
   */
  const sections = [
    ...grouped.map((group) => ({
      key: group.id,
      title: t(`cat_${group.id}`),
      products: group.products
    })),
    ...(uncategorised.length > 0
      ? [{key: 'other', title: t('other'), products: uncategorised}]
      : [])
  ];

  const productPrices = new Map(
    await Promise.all(
      sections
        .flatMap((section) => section.products)
        .map(async (p) => [p.slug, await getPrice(p.priceId)] as const)
    )
  );
  const guidePrices = new Map(
    await Promise.all(
      guides.map(async (g) => [g.slug, await getPrice(g.priceId)] as const)
    )
  );

  const nothingToSell = sections.length === 0 && guides.length === 0;

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} />

      {nothingToSell && (
        <p className="px-6 pb-24 text-center text-xl text-black">
          {t('empty')}
        </p>
      )}

      {/* One section per shelf, in the same treatment the homepage uses for
          bestsellers. A category with nothing in it never reaches here. */}
      {sections.map((section) => (
        <CollectionSection key={section.key} title={section.title}>
          {section.products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              price={productPrices.get(product.slug) ?? null}
            />
          ))}
        </CollectionSection>
      ))}

      {/* Guides are the other half of what the shop sells, so they get the
          same block rather than a smaller one. */}
      {guides.length > 0 && (
        <CollectionSection
          title={t('guidesTitle')}
          intro={t('guidesBody')}
          href="/guides"
          cta={t('guidesCta')}
          className="mb-3 sm:mb-5"
        >
          {guides.map((guide) => (
            <GuideCard
              key={guide.slug}
              guide={guide}
              price={guidePrices.get(guide.slug) ?? null}
            />
          ))}
        </CollectionSection>
      )}

      {/* Nothing published yet, but the shop should still say the library
          exists rather than pretend it does not. */}
      {guides.length === 0 && !nothingToSell && (
        <CollectionSection
          title={t('guidesTitle')}
          intro={tGuides('empty')}
          href="/guides"
          cta={t('guidesCta')}
          className="mb-3 sm:mb-5"
        >
          {[]}
        </CollectionSection>
      )}
    </>
  );
}
