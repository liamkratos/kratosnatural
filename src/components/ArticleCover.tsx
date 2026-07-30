import Image from 'next/image';
import type {Article, ArticleSummary} from '@/lib/mdx';

/**
 * Cover artwork for an article that has no photograph of its own.
 *
 * Rather than dropping in stock imagery — which on an evidence-led page reads as
 * padding and undercuts the sourcing work — this derives from the site's own
 * hero photograph and carries the article's actual subject: its tags and the
 * number of sources behind it. It renders with the real site fonts, so it can
 * never drift from the brand the way an exported image would.
 *
 * An article that supplies `image` in its frontmatter uses that instead.
 */
export default function ArticleCover({
  article,
  className,
  priority = false
}: {
  article: Article | ArticleSummary;
  className?: string;
  priority?: boolean;
}) {
  const tags = (article.tags ?? []).slice(0, 3);
  const sources = article.citations.length;

  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden bg-black">
        {/* The site's own photograph, pushed back so type stays legible. */}
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="scale-105 object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/85"
        />

        <div className="relative flex h-full flex-col justify-between p-6 text-left sm:p-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-pink">
            {tags.length > 0 ? tags.join(' · ') : 'Research'}
          </p>

          {/* Short label, not the full headline: the card repeats the title
              immediately below the cover, and the long version wraps to four
              lines here. */}
          <p className="font-display text-4xl uppercase leading-none text-cream sm:text-5xl">
            {article.shortTitle ?? article.title}
          </p>

          {sources > 0 && (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cream">
              {sources} sources
              {article.studyCount ? ` · ${article.studyCount} studies` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
