import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getArticles} from '@/lib/mdx';
import {getBestsellers} from '@/lib/products';
import {getPrice} from '@/lib/pricing';
import Container from '@/components/Container';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import ArticleCard from '@/components/ArticleCard';
import ProductCard from '@/components/ProductCard';
import WhereNext from '@/components/WhereNext';

export default async function HomePage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const tArticles = await getTranslations('Articles');
  const articles = (await getArticles(locale)).slice(0, 2);
  const tShop = await getTranslations('Shop');
  const bestsellers = await getBestsellers(locale, 4);
  const bestsellerPrices = await Promise.all(
    bestsellers.map((product) => getPrice(product.priceId))
  );

  return (
    <>
      <Hero />

      {/* Evidence section. The brand's distinguishing artifact is the lab
          record, so the figures are set in the mono face and treated as the
          visual material rather than being dressed up. */}
      <section className="floating mx-3 mt-3 bg-white py-24 text-ink sm:mx-5 sm:py-32">
        <Container className="max-w-6xl">
          <Reveal>
            <h2
              className="quoted whitespace-nowrap text-center font-display font-bold uppercase leading-tight"
              style={{fontSize: 'clamp(0.85rem, 3.4vw, 3.5rem)'}}
            >
              {t('title')}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-center font-display text-xl uppercase leading-snug text-black sm:text-2xl">
              {t('intro')}
            </p>
          </Reveal>

          <dl className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              {value: 'PubMed', label: t('stat1')},
              {value: '100%', label: t('stat2')},
              {value: '0', label: t('stat3')}
            ].map((stat, index) => (
              <Reveal key={stat.value} delay={index * 60}>
                <div className="floating h-full bg-white p-8">
                  <dt className="font-mono text-3xl font-bold tabular-nums text-ink">
                    {stat.value}
                  </dt>
                  <dd className="mt-3 font-display text-lg uppercase leading-snug text-black sm:text-xl">
                    {stat.label}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Bestsellers, above the research block. Same card as the shop so the
          two pages cannot drift apart. */}
      {bestsellers.length > 0 && (
        <section className="floating mx-3 mt-3 bg-white py-24 text-ink sm:mx-5 sm:py-32">
          <Container className="max-w-6xl">
            <Reveal>
              <h2
                className="quoted whitespace-nowrap text-center font-display font-bold uppercase leading-tight"
                style={{fontSize: 'clamp(2.5rem, 9vw, 7rem)'}}
              >
                {tShop('bestsellers')}
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {bestsellers.map((product, index) => (
                <Reveal key={product.slug} delay={index * 60}>
                  <ProductCard
                    product={product}
                    price={bestsellerPrices[index]}
                  />
                </Reveal>
              ))}
            </div>

            <Reveal>
              <Link
                href="/shop"
                className="mt-14 inline-flex items-center justify-center rounded-[20px] bg-black px-8 py-4 font-display text-xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink"
              >
                {tShop('viewAll')}
              </Link>
            </Reveal>
          </Container>
        </section>
      )}

      {/* Research. Real, cited articles — the nattokinase piece is the showcase
          until more are published. */}
      {articles.length > 0 && (
        <section className="floating mx-3 mt-3 bg-white py-24 text-ink sm:mx-5 sm:py-32">
          <Container className="max-w-6xl">
            <Reveal>
              <h2
                className="quoted whitespace-nowrap text-center font-display font-bold uppercase leading-tight"
                style={{fontSize: 'clamp(2.5rem, 9vw, 7rem)'}}
              >
                {tArticles('title')}
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-center font-display text-xl uppercase leading-snug text-black sm:text-2xl">
                {tArticles('intro')}
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <Reveal key={article.slug} delay={index * 60}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Sits directly above the mailing list block, which the layout renders
          after this page's content. */}
      <Reveal>
        <WhereNext className="mx-3 mt-3 sm:mx-5" />
      </Reveal>
    </>
  );
}
