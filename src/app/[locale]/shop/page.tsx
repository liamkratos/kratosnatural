import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getProducts} from '@/lib/products';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Card from '@/components/Card';
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

  return (
    <Container className="max-w-6xl py-24">
      <Card>
        <h1
          className="quoted whitespace-nowrap font-display font-bold uppercase leading-tight"
          style={{fontSize: 'clamp(2.5rem, 9vw, 7rem)'}}
        >
          {t('title')}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-xl leading-snug text-black sm:text-2xl">
          {t('intro')}
        </p>
      </Card>

      {/* Guides live under the shop, so the shop has to say so. A menu entry
          that is the only route to a whole half of what we sell is a menu
          entry doing too much work. */}
      <Card className="mt-6">
        <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
          {t('guidesTitle')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
          {t('guidesBody')}
        </p>
        <Link
          href="/guides"
          className="mt-6 inline-block rounded-[20px] bg-olive px-7 py-4 font-display text-lg uppercase leading-none text-white transition-colors duration-200 hover:bg-oliveSoft"
        >
          {t('guidesCta')}
        </Link>
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
