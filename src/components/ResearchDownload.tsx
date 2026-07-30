import {useTranslations} from 'next-intl';

/**
 * Download block for an article's underlying dataset.
 *
 * Driven by frontmatter rather than hard-coded per article, so any future
 * analysis can offer its own file by adding a `download` block. Rendered only
 * when one is present.
 */
export type ArticleDownload = {
  /** Path under /public, e.g. "/downloads/nattokinase-research-database.xlsx". */
  file: string;
  /** Human-readable size, e.g. "81 KB". */
  size?: string;
  /** What the file contains, one line per bullet. */
  contents?: string[];
  /** Who it is useful to. */
  audience?: string;
};

export default function ResearchDownload({
  download,
  studyCount
}: {
  download: ArticleDownload;
  studyCount?: number;
}) {
  const t = useTranslations('Article');
  const extension = download.file.split('.').pop()?.toUpperCase() ?? 'FILE';

  return (
    <aside
      aria-labelledby="research-download-heading"
      className="meta-info my-12"
    >
      <h2 id="research-download-heading" className="block-heading text-2xl">
        {t('downloadTitle')}
      </h2>

      <p className="mt-2">
        {studyCount
          ? t('downloadIntroWithCount', {count: studyCount})
          : t('downloadIntro')}
      </p>

      {download.contents && download.contents.length > 0 && (
        <ul className="mt-4 list-disc space-y-1.5 pl-5">
          {download.contents.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {download.audience && (
        <p className="mt-4">
          <strong>{t('downloadFor')}</strong> {download.audience}
        </p>
      )}

      {/* `download` asks the browser to save rather than navigate; the type and
          size are stated so nobody clicks blind. */}
      <a
        href={download.file}
        download
        className="mt-6 inline-flex items-center justify-center rounded-[5px] bg-[#0066cc] px-6 py-3 font-semibold !text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052a3]"
      >
        {t('downloadNow')}
        <span className="ml-2 font-normal opacity-80">
          {extension}
          {download.size ? ` · ${download.size}` : ''}
        </span>
      </a>
    </aside>
  );
}
