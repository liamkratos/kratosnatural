import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {getAllArticleParams, getArticle} from '@/lib/mdx';
import {buildMetadata} from '@/lib/seo';
import {articlePageSchema, breadcrumbSchema} from '@/lib/schema';
import {formatDate} from '@/lib/utils';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import Mdx from '@/components/Mdx';
import KeyFindings from '@/components/KeyFindings';
import TableOfContents from '@/components/TableOfContents';
import Citations from '@/components/Citations';

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
    publishedTime: article.publishDate,
    modifiedTime: article.updatedDate ?? article.publishDate,
    noIndex: article.draft
  });
}

export default async function ArticlePage({params: {locale, slug}}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const article = await getArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations('Article');
  const tArticles = await getTranslations('Articles');
  const pathname = `/articles/${slug}`;

  return (
    <Container className="py-16">
      <article>
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-kratos-900">
            {article.title}
          </h1>

          {/* Stated up front so the claim's provenance is visible without
              scrolling: who wrote it, when it was last reviewed, how many
              sources back it. */}
          <p className="mt-4 text-sm text-kratos-500">
            <span>{t('byAuthor', {author: article.author})}</span>
            {' · '}
            <time dateTime={article.publishDate}>
              {tArticles('publishedOn', {
                date: formatDate(article.publishDate, locale)
              })}
            </time>
            {article.updatedDate && (
              <>
                {' · '}
                <time dateTime={article.updatedDate}>
                  {t('updatedOn', {
                    date: formatDate(article.updatedDate, locale)
                  })}
                </time>
              </>
            )}
            {' · '}
            {tArticles('readingTime', {minutes: article.readingTimeMinutes})}
          </p>

          <p className="mt-6 text-lg text-kratos-700">{article.description}</p>

          {article.image && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[20px] bg-ink/5">
              <Image
                src={article.image}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </header>

        <KeyFindings
          findings={article.keyFindings}
          studyCount={article.studyCount}
          citationCount={article.citations.length}
        />

        <TableOfContents entries={article.toc} />

        <div className="mt-10">
          <Mdx source={article.body} citations={article.citations} />
        </div>

        <Citations citations={article.citations} />
      </article>

      <JsonLd
        schema={[
          articlePageSchema(article, pathname),
          breadcrumbSchema(locale, [
            {name: tArticles('title'), pathname: '/articles'},
            {name: article.title, pathname}
          ])
        ]}
      />
    </Container>
  );
}
