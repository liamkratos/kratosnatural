import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {ArticleSummary} from '@/lib/mdx';
import {formatDate} from '@/lib/utils';

export default function ArticleCard({article}: {article: ArticleSummary}) {
  const t = useTranslations('Articles');
  const tArticle = useTranslations('Article');

  return (
    <article className="border-b border-ink/10 py-10 last:border-0">
      {/* Rendered only when the article supplies an `image`; a missing file
          would otherwise show a broken placeholder on every card. */}
      {article.image && (
        <Link href={`/articles/${article.slug}`} className="block" tabIndex={-1}>
          <span className="relative mb-5 block aspect-[3/2] overflow-hidden rounded-[20px] bg-ink/5">
            <Image
              src={article.image}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </span>
        </Link>
      )}
      <h2 className="font-display text-3xl font-bold uppercase leading-tight text-ink">
        <Link
          href={`/articles/${article.slug}`}
          className="transition-colors duration-200 hover:text-pink"
        >
          {article.title}
        </Link>
      </h2>

      <p className="mt-3 font-display text-xl uppercase leading-snug text-ink/70">{article.description}</p>

      {article.keyFindings.length > 0 && (
        <p className="mt-3 font-display text-lg uppercase leading-snug text-ink/60">
          {article.keyFindings[0]}
        </p>
      )}

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/50">
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
