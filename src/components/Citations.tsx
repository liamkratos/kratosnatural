import {useTranslations} from 'next-intl';
import {citationUrl, type Citation} from '@/lib/mdx';

/**
 * Numbered source list rendered at the end of the article.
 *
 * Numbering matches the in-text <Cite n={…} /> markers, and each entry links to
 * PubMed where a PMID exists so the claim can be checked at the source.
 */
export default function Citations({citations}: {citations: Citation[]}) {
  const t = useTranslations('Article');

  if (citations.length === 0) return null;

  return (
    <section
      aria-labelledby="citations-heading"
      className="mt-16 border-t border-kratos-100 pt-8"
    >
      <h2
        id="citations-heading"
        className="text-xl font-semibold tracking-tight text-kratos-900"
      >
        {t('sources')}
      </h2>

      <ol className="mt-6 space-y-4">
        {citations.map((citation, index) => {
          const number = index + 1;
          const href = citationUrl(citation);

          return (
            <li
              key={number}
              id={`source-${number}`}
              className="flex gap-3 text-left text-sm leading-relaxed text-kratos-700 target:bg-kratos-50"
            >
              <span className="shrink-0 font-medium text-kratos-900">
                {number}.
              </span>

              <span>
                {citation.text}{' '}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-kratos-700 underline underline-offset-4"
                  >
                    {citation.pmid
                      ? `PMID ${citation.pmid}`
                      : citation.doi
                        ? `DOI ${citation.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '')}`
                        : t('viewSource')}
                  </a>
                )}
                <a
                  href={`#cite-ref-${number}`}
                  aria-label={t('backToText', {number})}
                  className="ml-2 text-kratos-500 no-underline hover:text-kratos-900"
                >
                  ↩
                </a>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
