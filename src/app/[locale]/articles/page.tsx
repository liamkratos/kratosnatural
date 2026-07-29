import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import {getArticles} from '@/lib/mdx';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import ArticleCard from '@/components/ArticleCard';

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string};
}): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: 'Articles'});

  return buildMetadata({
    locale,
    title: t('title'),
    description: t('intro'),
    pathname: '/articles'
  });
}

export default async function ArticlesPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Articles');
  const articles = await getArticles(locale);

  return (
    <Container className="py-16">
      <h1
        className="whitespace-nowrap font-display font-bold uppercase leading-tight"
        style={{fontSize: 'clamp(2.5rem, 9vw, 7rem)'}}
      >
        {t('title')}
      </h1>
      <p className="mx-auto mt-4 max-w-3xl font-display text-xl uppercase leading-snug text-ink/70 sm:text-2xl">{t('intro')}</p>

      <div className="mt-10">
        {articles.length === 0 ? (
          <p className="font-display text-xl uppercase text-ink/60">{t('empty')}</p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))
        )}
      </div>
    </Container>
  );
}
