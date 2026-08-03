import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {ArticleSummary} from '@/lib/mdx';

/**
 * Related analyses, at the foot of every article.
 *
 * Generated rather than written into each piece. Hand-placed cross-links go
 * stale the moment an article is renamed or retired, and the one that matters
 * most, the link from the newest piece to the older ones, only exists if
 * somebody remembers to go back and add it. Generated, every analysis links to
 * every other one from the day it is published.
 *
 * This is also what lets a crawler, and a language model reading the site, see
 * that these pages belong together rather than treating each as an orphan.
 *
 * Set in the research typography, since it sits inside a paper.
 */
export default function RelatedArticles({
  articles
}: {
  articles: ArticleSummary[];
}) {
  const t = useTranslations('Articles');

  if (articles.length === 0) return null;

  return (
    <nav
      aria-labelledby="related-heading"
      className="mt-16 border-t border-[#e0e0e0] pt-8"
    >
      <h2 id="related-heading" className="block-heading">
        {t('related')}
      </h2>

      <ul className="mt-6 space-y-4">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link className="pmid-link" href={`/articles/${article.slug}`}>
              {article.title}
            </Link>
            <p className="mt-1 text-[0.95em]">{article.description}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}
