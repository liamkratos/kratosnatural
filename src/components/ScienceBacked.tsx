import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {ResolvedResearch} from '@/lib/product-research';

/**
 * Evidence block on a product page.
 *
 * Each claim carries the link to the analysis it came from, right next to the
 * sentence rather than collected in a footer. The point is that a reader can
 * check any single claim in one click — including reading the trials that found
 * nothing, which the analyses report alongside the ones that found something.
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
      className="floating mt-16 bg-white p-6 text-left sm:p-10"
    >
      <h2
        id="science-backed-heading"
        className="quoted font-display text-3xl font-bold uppercase leading-none sm:text-4xl"
      >
        {t('research')}
      </h2>

      <p className="mt-4 max-w-2xl font-display text-lg uppercase leading-snug text-black">
        {t('researchIntro')}
      </p>

      {research.claims.length > 0 && (
        <ul className="mt-8 space-y-4">
          {research.claims.map((claim) => (
            <li
              key={claim.text}
              className="floating bg-white p-5"
            >
              <p className="font-display text-xl uppercase leading-snug">
                {claim.text}
              </p>
              <Link
                href={claim.href}
                className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.2em] text-black underline underline-offset-4 transition-colors duration-200 hover:text-pink"
              >
                {claim.articleTitle}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {research.articles.map((article) => (
          <Link
            key={article.slug}
            href={article.href}
            className="floating group bg-white p-5 transition-colors duration-200 hover:border-pink"
          >
            <p className="font-display text-2xl font-bold uppercase leading-none">
              {article.shortTitle ?? article.title}
            </p>

            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-black">
              {article.studyCount !== undefined
                ? t('researchStudies', {count: article.studyCount})
                : t('researchStudies', {count: article.citationCount})}
            </p>

            <p className="mt-4 font-display text-lg uppercase leading-snug text-black underline underline-offset-4 transition-colors duration-200 group-hover:text-pink">
              {t('researchRead')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
