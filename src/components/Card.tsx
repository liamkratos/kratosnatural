import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

/**
 * The page section, as a floating card.
 *
 * Every section of every page sits in one of these, in the manner of the About
 * page: white surface, one outline weight, one shadow, 20px corners. Content
 * never touches the page background directly, so a page reads as a stack of
 * objects on white rather than as text poured onto a sheet.
 *
 * The visual values live in `.floating` (globals.css), shared with the product
 * and article cards, so a section and a card can never drift apart.
 */
export default function Card({
  children,
  className,
  id,
  as: Tag = 'section'
}: {
  children: ReactNode;
  className?: string;
  /** Anchor id, for sections that can be linked to directly. */
  id?: string;
  as?: 'section' | 'div';
}) {
  return (
    <Tag id={id} className={cn('floating bg-white p-6 sm:p-10', className)}>
      {children}
    </Tag>
  );
}
