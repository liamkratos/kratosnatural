import type {ReactNode} from 'react';
import {Link} from '@/i18n/navigation';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import ScrollRow from '@/components/ScrollRow';
import {cn} from '@/lib/utils';

/**
 * A named collection: a big heading, a row of cards that scrolls, and a way
 * through to the rest of it.
 *
 * Extracted because the homepage and the shop were drawing the same block by
 * hand and had already drifted — the bestsellers block was a full-width
 * section with a display heading, while the guides on the shop page were a
 * small heading inside a card with a text link floated to the side. They are
 * the same idea and now they are the same component, so a change to one is a
 * change to all of them.
 *
 * The heading tracks the viewport rather than sitting at a fixed size, which
 * is what makes a collection announce itself: this is the level of the page
 * where a reader is choosing what to look at, not reading.
 */
export default function CollectionSection({
  title,
  intro,
  href,
  cta,
  children,
  className
}: {
  title: string;
  /** Optional line under the heading. */
  intro?: ReactNode;
  /** Where "see everything" goes. Omit for a collection that is already whole. */
  href?: string;
  cta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'floating mx-3 mt-3 bg-white py-24 text-ink sm:mx-5 sm:py-32',
        className
      )}
    >
      <Container className="max-w-6xl">
        <Reveal>
          <h2
            className="quoted text-balance text-center font-display font-bold uppercase leading-tight"
            style={{fontSize: 'clamp(2.5rem, 9vw, 7rem)'}}
          >
            {title}
          </h2>

          {intro && (
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-snug text-black sm:text-xl">
              {intro}
            </p>
          )}
        </Reveal>

        <ScrollRow label={title} className="mt-14">
          {children}
        </ScrollRow>

        {href && cta && (
          <Reveal>
            <Link
              href={href}
              className="mt-14 inline-flex items-center justify-center rounded-[20px] bg-olive px-8 py-4 font-display text-xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink"
            >
              {cta}
            </Link>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
