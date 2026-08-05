'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {addLine} from '@/lib/cart';

/**
 * Add-to-cart control.
 *
 * Two shapes. `full` is the button on a product page. `icon` is the round
 * control that sits in the corner of a card's photograph, so a shopper can add
 * from a grid without opening the product.
 *
 * The icon is 40px rather than the 20px this pattern usually gets: below about
 * 40 it is a coin-flip to hit with a thumb, and a control that is easy to miss
 * on a phone is worse than no shortcut at all.
 *
 * Both confirm in place for a moment rather than navigating away, so the buyer
 * can keep browsing. The cart in the header updates at the same time through
 * the cart change event.
 */
export default function AddToCart({
  slug,
  title,
  amountCents,
  currency,
  image,
  disabled = false,
  variant = 'full'
}: {
  slug: string;
  title: string;
  amountCents: number;
  currency: string;
  image?: string;
  disabled?: boolean;
  variant?: 'full' | 'icon';
}) {
  const t = useTranslations('Shop');
  const [added, setAdded] = useState(false);

  const add = () => {
    addLine({slug, title, amountCents, currency, image});
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={add}
        // The label carries the product name: in a grid, six buttons all
        // announced as "add to cart" tell a screen-reader user nothing.
        aria-label={`${t('addToCart')}: ${title}`}
        title={t('addToCart')}
        className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-olive text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-oliveSoft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white"
      >
        <span aria-live="polite" className="sr-only">
          {added ? t('added') : ''}
        </span>
        {added ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
            <path d="M4 12.5l5.5 5.5L20 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={add}
      className="w-full rounded-[20px] bg-olive px-8 py-4 font-display text-2xl uppercase leading-none text-white transition-colors duration-200 hover:bg-oliveSoft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white"
    >
      {/* aria-live so the confirmation is announced, not just seen. */}
      <span aria-live="polite">{added ? t('added') : t('addToCart')}</span>
    </button>
  );
}
