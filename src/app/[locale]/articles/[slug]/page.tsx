import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {getAllArticleParams, getArticle} from '@/lib/mdx';
import {buildMetadata} from '@/lib/seo';
import {articlePageSchema, breadcrumbSchema} from '@/lib/schema';
import {formatDate} from '@/lib/utils';
import JsonLd from '@/components/JsonLd';
import Mdx from '@/components/Mdx';
import KeyFindings from '@/components/KeyFindings';
import TableOfContents from '@/components/TableOfContents';
import Citations from '@/components/Citations';
import ResearchDownload from '@/components/ResearchDownload';

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

  // 900px is the source document's own measure — wide enough for the data
  // tables, narrow enough to read.
  return (
    <div className="paper mx-auto w-full max-w-[900px] px-3 py-16 sm:px-5">
      <article className="paper-sheet rounded-[20px] border border-[#e0e0e0] p-6 sm:p-10">
        <header>
          <h1>{article.title}</h1>

          {/* Stated up front so the claim's provenance is visible without
              scrolling: who wrote it, when it was last reviewed, how many
              sources back it. */}
          <div className="meta-info">
            <p>
              <strong>{t('metaAuthorLabel')}</strong>{' '}
              {article.author}
              {' | '}
              <strong>{t('metaPublishedLabel')}</strong>{' '}
              <time dateTime={article.publishDate}>
                {formatDate(article.publishDate, locale)}
              </time>
              {article.updatedDate && (
                <>
                  {' | '}
                  <strong>{t('metaUpdatedLabel')}</strong>{' '}
                  <time dateTime={article.updatedDate}>
                    {formatDate(article.updatedDate, locale)}
                  </time>
                </>
              )}
            </p>
            <p>
              {article.studyCount !== undefined && (
                <>
                  <strong>{t('metaSourcesLabel')}</strong>{' '}
                  {t('metaSourcesValue', {count: article.studyCount})}
                  {' | '}
                </>
              )}
              <strong>{t('metaCitedLabel')}</strong>{' '}
              {t('metaCitedValue', {count: article.citations.length})}
              {' | '}
              {tArticles('readingTime', {minutes: article.readingTimeMinutes})}
            </p>
          </div>

          <p className="text-[1.1em]">{article.description}</p>

          {article.image && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[5px] bg-[#f0f0f0]">
              <Image
                src={article.image}
                alt=""
                fill
                priority
                sizes="(min-width: 900px) 900px, 100vw"
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

        {article.download && (
          <ResearchDownload
            download={article.download}
            studyCount={article.studyCount}
          />
        )}

        <TableOfContents entries={article.toc} />

        <Mdx source={article.body} citations={article.citations} />

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
    </div>
  );
}
