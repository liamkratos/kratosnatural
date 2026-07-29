import Image from 'next/image';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getArticles} from '@/lib/mdx';
import {formatDate} from '@/lib/utils';
import Container from '@/components/Container';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';

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

  return (
    <>
      <Hero />

      {/* Evidence section. The brand's distinguishing artifact is the lab
          record, so the figures are set in the mono face and treated as the
          visual material rather than being dressed up. */}
      <section className="bg-white py-24 text-ink sm:py-32">
        <Container className="max-w-6xl">
          <Reveal>
            <h2
              className="whitespace-nowrap text-center font-display font-bold uppercase leading-tight"
              style={{fontSize: 'clamp(0.85rem, 3.4vw, 3.5rem)'}}
            >
              {t('title')}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-center font-display text-xl uppercase leading-snug text-ink/70 sm:text-2xl">{t('intro')}</p>
          </Reveal>

          <dl className="mt-16 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-3">
            {[
              {value: 'PubMed', label: t('stat1')},
              {value: '100%', label: t('stat2')},
              {value: '0', label: t('stat3')}
            ].map((stat, index) => (
              <Reveal key={stat.value} delay={index * 60}>
                <div className="h-full bg-white p-8">
                  <dt className="font-mono text-3xl tabular-nums text-ink">
                    {stat.value}
                  </dt>
                  <dd className="mt-3 font-display text-lg uppercase leading-snug text-ink/70 sm:text-xl">
                    {stat.label}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Research. Real, cited articles — the nattokinase piece is the showcase
          until more are published. */}
      {articles.length > 0 && (
        <section className="bg-cream py-24 text-ink sm:py-32">
          <Container className="max-w-6xl">
            <Reveal>
              <h2
                className="whitespace-nowrap text-center font-display font-bold uppercase leading-tight"
                style={{fontSize: 'clamp(2.5rem, 9vw, 7rem)'}}
              >
                {tArticles('title')}
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-center font-display text-xl uppercase leading-snug text-ink/70 sm:text-2xl">{tArticles('intro')}</p>
            </Reveal>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {articles.map((article, index) => (
                <Reveal key={article.slug} delay={index * 60}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group flex h-full flex-col justify-between border border-ink/10 bg-white p-8 transition-colors duration-300 hover:border-ink/30"
                  >
                    <div>
                      {article.image && (
                        <span className="relative mb-6 block aspect-[3/2] overflow-hidden rounded-[20px] bg-ink/5">
                          <Image
                            src={article.image}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </span>
                      )}
                      <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                        <time dateTime={article.publishDate}>
                          {formatDate(article.publishDate, locale)}
                        </time>
                        {article.citations.length > 0 && (
                          <> · {article.citations.length} PMID</>
                        )}
                      </p>
                      <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-tight group-hover:text-pink">
                        {article.title}
                      </h3>
                      <p className="mt-3 font-display text-xl uppercase leading-snug text-ink/70">
                        {article.description}
                      </p>
                    </div>
                    <p className="mt-6 font-display text-lg uppercase text-ink/60">
                      {tArticles('readMore')} →
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
