import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

/**
 * A single row of cards that scrolls sideways.
 *
 * Used where a section is a *taste* of a collection rather than the collection
 * itself — the guides on the shop page, the research on the homepage. A grid
 * says "this is everything"; a row that runs off the edge says "there is more
 * this way", which is the honest signal when there are forty guides and the
 * page is showing six.
 *
 * Built on native scrolling with scroll-snap rather than a carousel library:
 * it costs no JavaScript, it keeps the keyboard and the trackpad behaving the
 * way the reader already expects, and a touch device gets its own momentum
 * scrolling for free.
 *
 * The row is a real focus scope, so a keyboard user can tab through the cards
 * and the browser scrolls to each in turn. `tabIndex={0}` on the scroller
 * itself is what lets somebody who is not using a pointer scroll it with the
 * arrow keys at all — without it the content is reachable but the container
 * is not scrollable by keyboard, which is a WCAG failure rather than a
 * nicety.
 */
export default function ScrollRow({
  children,
  label,
  className,
  itemClassName
}: {
  children: ReactNode;
  /** Accessible name — what this row is a list of. */
  label: string;
  className?: string;
  /** Width of each card. Defaults to roughly one and a half on a phone. */
  itemClassName?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        // `-mx-*` plus matching padding lets the first and last card sit flush
        // with the page edge while still having breathing room when scrolled.
        'scrollbar-thin -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive',
        className
      )}
    >
      {/* Each child is wrapped rather than styled in place, so a caller can
          pass the same card component used in the grids elsewhere. */}
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'w-[68vw] shrink-0 snap-start sm:w-[42vw] lg:w-[23rem]',
                itemClassName
              )}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
