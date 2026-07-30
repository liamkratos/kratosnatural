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
      className="mt-16 border-t border-[#e0e0e0] pt-8"
    >
      <h2 id="citations-heading" className="block-heading">
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
              className="flex gap-3 text-left text-[0.95em] target:bg-[#fff3cd]"
            >
              <span className="shrink-0 font-semibold text-[#0066cc]">
                {number}.
              </span>

              <span>
                {citation.text}{' '}
                {href && (
                  <a
                    className="pmid-link whitespace-nowrap"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {citation.pmid
                      ? `PMID: ${citation.pmid}`
                      : citation.doi
                        ? `DOI ${citation.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '')}`
                        : t('viewSource')}
                  </a>
                )}
                <a
                  href={`#cite-ref-${number}`}
                  aria-label={t('backToText', {number})}
                  className="pmid-link ml-2"
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
