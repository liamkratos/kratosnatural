import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import {Link} from '@/i18n/navigation';
import {getArticles} from '@/lib/mdx';
import {getBestsellers} from '@/lib/products';
import {getGuides} from '@/lib/guides';
import {getPrice} from '@/lib/pricing';
import Container from '@/components/Container';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import CollectionSection from '@/components/CollectionSection';
import ArticleCard from '@/components/ArticleCard';
import ProductCard from '@/components/ProductCard';
import GuideCard from '@/components/GuideCard';
import WhereNext from '@/components/WhereNext';
import Reviews from '@/components/Reviews';

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: 'Seo'});

  return buildMetadata({
    locale,
    title: t('homeTitle'),
    description: t('homeDescription'),
    pathname: '/'
  });
}

export default async function HomePage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  /** Bold anchors inside the copy; see the note in globals.css. */
  const bold = {
    b: (chunks: React.ReactNode) => <b className="font-semibold">{chunks}</b>
  };
  const tArticles = await getTranslations('Articles');
  const articles = (await getArticles(locale)).slice(0, 2);
  const tShop = await getTranslations('Shop');
  const bestsellers = await getBestsellers(locale, 4);

  // A taste of the library. The row running off the edge is what says there is
  // more, so it is capped rather than showing everything.
  const guides = (await getGuides(locale)).slice(0, 8);
  const bestsellerPrices = await Promise.all(
    bestsellers.map((product) => getPrice(product.priceId))
  );
  const guidePrices = await Promise.all(
    guides.map((guide) => getPrice(guide.priceId))
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
              className="quoted text-balance text-center font-display font-bold uppercase leading-tight"
              style={{fontSize: 'clamp(1.6rem, 5.2vw, 5rem)'}}
            >
              {t('title')}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-center text-xl leading-snug text-black sm:text-2xl">
              {t.rich('intro', bold)}
            </p>
          </Reveal>

          <dl className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              {value: 'PubMed', key: 'stat1'},
              {value: '100%', key: 'stat2'},
              {value: '0', key: 'stat3'}
            ].map((stat, index) => (
              <Reveal key={stat.value} delay={index * 60}>
                <div className="floating h-full bg-white p-8">
                  <dt className="font-mono text-3xl font-bold tabular-nums text-ink">
                    {stat.value}
                  </dt>
                  <dd className="mt-3 text-lg leading-snug text-black sm:text-xl">
                    {t.rich(stat.key, bold)}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Bestsellers. Same component as every other collection on the site,
          so the shop and the homepage cannot drift apart the way they had. */}
      {bestsellers.length > 0 && (
        <CollectionSection
          title={tShop('bestsellers')}
          href="/shop"
          cta={tShop('viewAll')}
        >
          {bestsellers.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              price={bestsellerPrices[index]}
              showDescription={false}
            />
          ))}
        </CollectionSection>
      )}

      {/* Guides, in the same block as the products, because they are the
          other half of what the shop sells rather than a lesser thing. */}
      {guides.length > 0 && (
        <CollectionSection
          title={tShop('guidesTitle')}
          intro={tShop('guidesBody')}
          href="/guides"
          cta={tShop('guidesCta')}
        >
          {guides.map((guide, index) => (
            <GuideCard
              key={guide.slug}
              guide={guide}
              price={guidePrices[index]}
            />
          ))}
        </CollectionSection>
      )}

      {/* Research. The row runs off the edge because the library grows;
          a grid would claim these few are all of it. */}
      {articles.length > 0 && (
        <CollectionSection
          title={tArticles('title')}
          intro={tArticles.rich('intro', bold)}
          href="/articles"
          cta={tArticles('viewAll')}
        >
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </CollectionSection>
      )}

      <Reviews />

      {/* Sits directly above the mailing list block, which the layout renders
          after this page's content. */}
      <Reveal>
        <WhereNext className="mx-3 mt-3 sm:mx-5" />
      </Reveal>
    </>
  );
}
