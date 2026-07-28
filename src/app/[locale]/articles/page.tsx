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
      <h1 className="text-3xl font-semibold tracking-tight text-kratos-900">
        {t('title')}
      </h1>
      <p className="mt-4 text-kratos-700">{t('intro')}</p>

      <div className="mt-10">
        {articles.length === 0 ? (
          <p className="text-kratos-500">{t('empty')}</p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))
        )}
      </div>
    </Container>
  );
}
