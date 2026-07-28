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
    <aside
      aria-labelledby="key-findings-heading"
      className="my-8 rounded-lg border border-kratos-300 bg-kratos-50 p-6"
    >
      <h2
        id="key-findings-heading"
        className="text-base font-semibold tracking-tight text-kratos-900"
      >
        {t('keyFindings')}
      </h2>

      <ul className="mt-4 space-y-3">
        {findings.map((finding, index) => (
          <li key={index} className="flex gap-3 text-kratos-900">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kratos-500"
            />
            <span>{finding}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-kratos-300 pt-4 text-sm text-kratos-700">
        {studyCount !== undefined
          ? t('basedOnWithStudies', {studies: studyCount, sources: citationCount})
          : t('basedOn', {sources: citationCount})}
      </p>
    </aside>
  );
}
