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
    <nav
      aria-labelledby="toc-heading"
      className="my-8 rounded-lg border border-kratos-100 p-6"
    >
      <h2
        id="toc-heading"
        className="text-sm font-semibold uppercase tracking-wide text-kratos-700"
      >
        {t('tableOfContents')}
      </h2>

      <ol className="mt-4 space-y-2 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={cn(entry.depth === 3 && 'ml-5 list-disc')}
          >
            <a
              href={`#${entry.id}`}
              className="text-kratos-700 underline-offset-4 hover:text-kratos-900 hover:underline"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
