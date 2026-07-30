'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {addLine} from '@/lib/cart';

/**
 * Add-to-cart button for a product page.
 *
 * Confirms in place for a moment rather than navigating away, so the buyer can
 * keep browsing. The cart icon in the header updates at the same time via the
 * cart change event.
 */
export default function AddToCart({
  slug,
  title,
  amountCents,
  currency,
  image,
  disabled = false
}: {
  slug: string;
  title: string;
  amountCents: number;
  currency: string;
  image?: string;
  disabled?: boolean;
}) {
  const t = useTranslations('Shop');
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addLine({slug, title, amountCents, currency, image});
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2000);
      }}
      className="w-full rounded-[20px] bg-black px-8 py-4 font-display text-2xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white"
    >
      {/* aria-live so the confirmation is announced, not just seen. */}
      <span aria-live="polite">{added ? t('added') : t('addToCart')}</span>
    </button>
  );
}
