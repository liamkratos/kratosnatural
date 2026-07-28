import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {getAllArticleParams, getArticle} from '@/lib/content';
import {buildMetadata} from '@/lib/seo';
import {articleSchema, breadcrumbSchema} from '@/lib/schema';
import {formatDate} from '@/lib/utils';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import Mdx from '@/components/Mdx';

type PageParams = {params: {locale: string; slug: string}};

export async function generateStaticParams() {
  return getAllArticleParams();
}

export async function generateMetadata({
  params: {locale, slug}
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) notFound();

  const article = await getArticle(locale, slug);
  if (!article) return {};

  return buildMetadata({
    locale,
    title: article.title,
    description: article.description,
    pathname: `/articles/${slug}`,
    image: article.image,
    type: 'article',
    publishedTime: article.date,
    modifiedTime: article.updated ?? article.date,
    noIndex: article.draft
  });
}

export default async function ArticlePage({params: {locale, slug}}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const article = await getArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations('Articles');
  const pathname = `/articles/${slug}`;

  return (
    <Container className="py-16">
      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-kratos-900">
          {article.title}
        </h1>

        <p className="mt-3 text-sm text-kratos-500">
          <time dateTime={article.date}>
            {t('publishedOn', {date: formatDate(article.date, locale)})}
          </time>
          {' · '}
          {t('readingTime', {minutes: article.readingTimeMinutes})}
        </p>

        <div className="mt-10">
          <Mdx source={article.body} />
        </div>
      </article>

      <JsonLd
        schema={[
          articleSchema(article, pathname),
          breadcrumbSchema(locale, [
            {name: t('title'), pathname: '/articles'},
            {name: article.title, pathname}
          ])
        ]}
      />
    </Container>
  );
}
