import type {ReactNode} from 'react';
import Container from '@/components/Container';

/**
 * The title block at the top of a listing page.
 *
 * Deliberately **not** a card, which is what it used to be. A page title is one
 * or two words, and a word set in a 1100px-wide bordered box occupies about a
 * fifth of it — "Shop" measured 194px of ink inside a 1104px card, leaving
 * 455px of empty white on either side and an outline drawn around the
 * emptiness. Shrinking the type makes that worse rather than better, because
 * the box stays the same size.
 *
 * So the box goes. The title sits on the page the way the hero wordmark does,
 * and the cards below it are the things that get outlines. That also gives a
 * listing page a rhythm — a wide, open header over a grid — instead of a stack
 * of same-width rectangles.
 *
 * The type scale is capped rather than tracking the viewport all the way up.
 * `9vw` on a wide screen produced 112px for a four-letter word, which is a
 * billboard for something nobody needs shouted.
 */
export default function PageHeader({
  title,
  intro,
  children
}: {
  title: string;
  /** One or two sentences under the title. */
  intro?: ReactNode;
  /** Anything extra, e.g. a second line of copy or a promise. */
  children?: ReactNode;
}) {
  return (
    <Container as="header" className="max-w-4xl px-0 pb-14 pt-4 text-center">
      <h1
        className="quoted font-display font-bold uppercase leading-[0.95]"
        style={{fontSize: 'clamp(2.75rem, 8vw, 5.5rem)'}}
      >
        {title}
      </h1>

      {intro && (
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-snug text-black sm:text-2xl">
          {intro}
        </p>
      )}

      {children}
    </Container>
  );
}
