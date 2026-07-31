import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {ResolvedResearch} from '@/lib/product-research';

/**
 * Evidence block on a product page.
 *
 * Set in the research document's own typography rather than the shop's, using
 * the same `.paper` treatment as the analyses: the reading face in sentence
 * case, blue headings, and the orange left rule that marks a study. A claim
 * about published evidence should look like the page it came from, not like
 * the product copy next to it, and that difference in setting is what tells a
 * reader which of the two they are looking at.
 *
 * Each claim carries the link to the analysis it came from, right next to the
 * sentence rather than collected in a footer, so any single one can be checked
 * in a click — including the trials that found nothing, which the analyses
 * report alongside the ones that found something.
 *
 * Rendered only when a product actually has research behind it. A product with
 * no published evidence shows no block, rather than a block saying nothing.
 */
export default function ScienceBacked({
  research
}: {
  research: ResolvedResearch;
}) {
  const t = useTranslations('Shop');

  return (
    <section
      aria-labelledby="science-backed-heading"
      className="paper floating paper-sheet mt-6 p-6 sm:p-10"
    >
      <h2 id="science-backed-heading" className="block-heading">
        {t('research')}
      </h2>

      <p className="mt-4 max-w-2xl">{t('researchIntro')}</p>

      {research.claims.length > 0 && (
        <ul className="mt-8">
          {research.claims.map((claim) => (
            <li key={claim.text} className="study-citation">
              <p>{claim.text}</p>
              <p className="mt-2">
                <Link className="pmid-link" href={claim.href}>
                  {claim.articleTitle}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {research.articles.map((article) => (
          <Link
            key={article.slug}
            href={article.href}
            className="meta-info group m-0 block transition-colors duration-200"
          >
            <p className="text-lg">
              <strong>{article.shortTitle ?? article.title}</strong>
            </p>

            <p className="mt-1">
              {article.studyCount !== undefined
                ? t('researchStudies', {count: article.studyCount})
                : t('researchStudies', {count: article.citationCount})}
            </p>

            <p className="pmid-link mt-3 group-hover:underline">
              {t('researchRead')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
