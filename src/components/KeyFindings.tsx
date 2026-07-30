import {useTranslations} from 'next-intl';

type KeyFindingsProps = {
  findings: string[];
  studyCount?: number;
  citationCount: number;
};

/**
 * Key findings box shown above the article body.
 *
 * Each finding is written to stand on its own when quoted out of context, so it
 * is rendered as a plain list item with no surrounding hedging.
 */
export default function KeyFindings({
  findings,
  studyCount,
  citationCount
}: KeyFindingsProps) {
  const t = useTranslations('Article');

  if (findings.length === 0) return null;

  return (
    <aside aria-labelledby="key-findings-heading" className="key-finding">
      <h2 id="key-findings-heading" className="block-heading text-xl">
        {t('keyFindings')}
      </h2>

      <ul className="mt-3 list-disc space-y-2 pl-5">
        {findings.map((finding, index) => (
          <li key={index}>{finding}</li>
        ))}
      </ul>

      <p className="mt-4 border-t border-[#ffb84d] pt-3 text-[0.95em]">
        {studyCount !== undefined
          ? t('basedOnWithStudies', {studies: studyCount, sources: citationCount})
          : t('basedOn', {sources: citationCount})}
      </p>
    </aside>
  );
}
