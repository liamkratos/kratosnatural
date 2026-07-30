import {useTranslations} from 'next-intl';
import type {TocEntry} from '@/lib/mdx';
import {cn} from '@/lib/utils';

/**
 * Table of contents built from the article's h2/h3 headings. Anchor ids come
 * from the same slugger rehype-slug uses, so every link resolves.
 */
export default function TableOfContents({entries}: {entries: TocEntry[]}) {
  const t = useTranslations('Article');

  if (entries.length < 2) return null;

  return (
    <nav aria-labelledby="toc-heading" className="toc">
      <h2 id="toc-heading" className="block-heading text-2xl">
        {t('tableOfContents')}
      </h2>

      <ol className="mt-3">
        {entries.map((entry) => (
          <li key={entry.id} className={cn(entry.depth === 3 && 'ml-5')}>
            <a href={`#${entry.id}`}>{entry.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
