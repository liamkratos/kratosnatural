import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {getAllProductParams, getProduct} from '@/lib/products';
import {resolveResearch} from '@/lib/product-research';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import {productSchema} from '@/lib/schema';
import {formatPrice} from '@/lib/utils';
import Container from '@/components/Container';
import Card from '@/components/Card';
import JsonLd from '@/components/JsonLd';
import Mdx from '@/components/Mdx';
import AddToCart from '@/components/AddToCart';
import ScienceBacked from '@/components/ScienceBacked';

type PageParams = {params: {locale: string; slug: string}};

export const revalidate = 300;

export async function generateStaticParams() {
  return getAllProductParams();
}

export async function generateMetadata({
  params: {locale, slug}
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const product = await getProduct(locale, slug);
  if (!product) return {};

  return buildMetadata({
    locale,
    title: product.title,
    description: product.description,
    pathname: `/shop/${slug}`,
    image: product.image,
    noIndex: product.draft
  });
}

export default async function ProductPage({
  params: {locale, slug}
}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const product = await getProduct(locale, slug);
  if (!product) notFound();

  const t = await getTranslations('Shop');
  const price = await getPrice(product.priceId);
  const research = await resolveResearch(product);
  // A price that is missing or archived must not be purchasable.
  const buyable = price !== null && price.active;

  return (
    <Container className="max-w-5xl py-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        <div className="floating relative aspect-square overflow-hidden bg-ink/5">
          {/* Moss backdrop: a square crop of the site's own stream photograph. */}
          <Image
            src="/moss.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-black/15" />

          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="relative object-contain p-8 drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-black">
              {t('photoComingSoon')}
            </span>
          )}
        </div>

        <Card className="text-left">
          <h1 className="font-display text-4xl font-bold uppercase leading-tight sm:text-5xl">
            {product.title}
          </h1>
          <p className="mt-3 font-display text-xl uppercase leading-snug text-black">
            {product.description}
          </p>

          <p className="mt-8 font-mono text-3xl tabular-nums">
            {price ? (
              <>
                {formatPrice(price.amountCents, locale)}
                {price.taxInclusive && (
                  <span className="ml-2 text-base text-black">
                    {t('inclVat')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-lg text-black">
                {t('priceUnavailable')}
              </span>
            )}
          </p>

          {/* A plain form post: no client-side JS needed to start checkout, so
              it still works if the bundle fails. The server resolves the price
              from the slug, never from anything the browser sends. */}
          <div className="mt-8">
            <AddToCart
              slug={slug}
              title={product.title}
              amountCents={price?.amountCents ?? 0}
              currency={price?.currency ?? 'eur'}
              image={product.image}
              disabled={!buyable}
            />
          </div>

          <form action="/api/checkout" method="post" className="mt-3">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              disabled={!buyable}
              className="w-full rounded-[20px] border border-ink/25 px-8 py-4 font-display text-2xl uppercase leading-none text-ink transition-colors duration-200 hover:text-pink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink"
            >
              {buyable ? t('buy') : t('unavailable')}
            </button>
          </form>

          <section className="mt-12">
            <h2 className="font-display text-2xl uppercase leading-none">
              {t('specs')}
            </h2>
            {product.specs.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {product.specs.map((spec) => (
                  <li
                    key={spec}
                    className="border-b border-ink/10 pb-2 font-mono text-sm text-black"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 font-mono text-sm text-black">
                {t('specsComingSoon')}
              </p>
            )}
          </section>
        </Card>
      </div>

      <Card className="mt-6 text-left">
        <Mdx source={product.body} />
      </Card>

      {research && <ScienceBacked research={research} />}

      {price && (
        <JsonLd
          schema={productSchema(locale, {
            name: product.title,
            description: product.description,
            image: product.image,
            priceEur: price.amountCents / 100,
            pathname: `/shop/${slug}`,
            inStock: buyable
          })}
        />
      )}
    </Container>
  );
}
