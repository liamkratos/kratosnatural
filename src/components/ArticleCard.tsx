import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {ArticleSummary} from '@/lib/mdx';
import {formatDate} from '@/lib/utils';
import ArticleCover from '@/components/ArticleCover';

/**
 * Article card, matched to the product card: a rounded block with the title at
 * the same size, closed by a real button rather than a text link.
 *
 * The card itself is not wrapped in a link. A card containing a button, wrapped
 * in an anchor, nests interactive elements — invalid HTML, and it makes keyboard
 * users tab twice through the same destination.
 */
export default function ArticleCard({article}: {article: ArticleSummary}) {
  const t = useTranslations('Articles');
  const tArticle = useTranslations('Article');

  return (
    <article className="group floating flex h-full flex-col overflow-hidden bg-white">
      {article.image ? (
        <span className="relative block aspect-[3/2] overflow-hidden bg-ink/5">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </span>
      ) : (
        <ArticleCover article={article} className="aspect-[3/2]" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-black">
          <time dateTime={article.publishDate}>
            {formatDate(article.publishDate, article.locale)}
          </time>
          {' · '}
          {t('readingTime', {minutes: article.readingTimeMinutes})}
          {article.citations.length > 0 && (
            <> · {tArticle('sourceCount', {count: article.citations.length})}</>
          )}
        </p>

        {/* Same size as the product card title. */}
        <h3 className="mt-3 font-display text-2xl uppercase leading-tight">
          {article.title}
        </h3>

        <p className="mt-2 flex-1 font-display text-lg uppercase leading-snug text-black">
          {article.description}
        </p>

        <Link
          href={`/articles/${article.slug}`}
          className="mt-6 inline-flex items-center justify-center self-center rounded-[20px] bg-black px-6 py-3 font-display text-lg uppercase leading-none text-white transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
        >
          {t('readMore')}
        </Link>
      </div>
    </article>
  );
}
