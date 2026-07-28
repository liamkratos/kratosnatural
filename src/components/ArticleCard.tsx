import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {ArticleSummary} from '@/lib/mdx';
import {formatDate} from '@/lib/utils';

export default function ArticleCard({article}: {article: ArticleSummary}) {
  const t = useTranslations('Articles');
  const tArticle = useTranslations('Article');

  return (
    <article className="border-b border-kratos-100 py-8 last:border-0">
      <h2 className="text-xl font-semibold tracking-tight text-kratos-900">
        <Link
          href={`/articles/${article.slug}`}
          className="underline-offset-4 hover:underline"
        >
          {article.title}
        </Link>
      </h2>

      <p className="mt-2 text-kratos-700">{article.description}</p>

      {article.keyFindings.length > 0 && (
        <p className="mt-3 text-sm text-kratos-700">
          {article.keyFindings[0]}
        </p>
      )}

      <p className="mt-3 text-sm text-kratos-500">
        <time dateTime={article.publishDate}>
          {formatDate(article.publishDate, article.locale)}
        </time>
        {' · '}
        {t('readingTime', {minutes: article.readingTimeMinutes})}
        {article.citations.length > 0 && (
          <>
            {' · '}
            {tArticle('sourceCount', {count: article.citations.length})}
          </>
        )}
      </p>
    </article>
  );
}
