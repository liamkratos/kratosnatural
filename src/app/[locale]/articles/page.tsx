import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getArticlesByCollection, getUncollectedArticles} from '@/lib/mdx';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import ArticleCard from '@/components/ArticleCard';
import Reveal from '@/components/Reveal';

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
    title: tSeo('articlesTitle'),
    description: tSeo('articlesDescription'),
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
  const groups = await getArticlesByCollection(locale);
  // Anything without a collection still gets shown, so an article can never
  // disappear from the site just because its frontmatter is incomplete.
  const uncollected = await getUncollectedArticles(locale);

  const sections = [
    ...groups,
    ...(uncollected.length > 0
      ? [{id: 'other' as const, label: t('other'), articles: uncollected}]
      : [])
  ];

  return (
    <Container className="max-w-6xl py-24">
      <PageHeader
        title={t('title')}
        intro={t.rich('intro', {b: (c) => <b>{c}</b>})}
      />

      {sections.length === 0 ? (
        <p className="mt-16 text-xl text-black">{t('empty')}</p>
      ) : (
        sections.map((section) => (
          <Card key={section.id} className="mt-6">
            <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
              {section.label}
            </h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.articles.map((article, index) => (
                <Reveal key={article.slug} delay={index * 60}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          </Card>
        ))
      )}
    </Container>
  );
}
