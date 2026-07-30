'use client';

import Image from 'next/image';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {
  CART_EVENT,
  CART_STORAGE_KEY,
  cartCount,
  cartTotalCents,
  readCart,
  removeLine,
  setQuantity,
  type CartLine
} from '@/lib/cart';
import {formatPrice} from '@/lib/utils';
import type {Locale} from '@/i18n/routing';
import {cn} from '@/lib/utils';

/**
 * Cart icon with an expanding panel.
 *
 * The cart is read after mount rather than during render: it lives in
 * localStorage, which the server cannot see, so rendering it directly would
 * produce markup that disagrees with the server's and trigger a hydration
 * mismatch. Starting empty and filling in on mount keeps them consistent.
 */
export default function CartButton({locale}: {locale: Locale}) {
  const t = useTranslations('Shop');
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => setLines(readCart()), []);

  useEffect(() => {
    refresh();
    // CART_EVENT covers this tab; `storage` covers the others.
    window.addEventListener(CART_EVENT, refresh);
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CART_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const count = cartCount(lines);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('cart')}
        title={t('cart')}
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path d="M4 6h16l-1.5 11.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5Z" />
          <path d="M9 6a3 3 0 0 1 6 0" />
        </svg>

        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink px-1 font-mono text-[0.6rem] leading-none text-black">
            {count}
          </span>
        )}
      </button>

      <div
        role="dialog"
        aria-label={t('cart')}
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-[20px] bg-black p-5 text-left text-cream shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {lines.length === 0 ? (
          <p className="font-display text-lg uppercase leading-none text-cream">
            {t('cartEmpty')}
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.slug} className="flex items-start gap-3">
                  {/* Thumbnail of the product, so a multi-line cart is scannable
                      without reading every title. */}
                  <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-white/10">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg uppercase leading-tight">
                      {line.title}
                    </p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-cream">
                      {formatPrice(line.amountCents, locale)} &times; {line.quantity}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={t('decrease')}
                      onClick={() => setQuantity(line.slug, line.quantity - 1)}
                      className="h-7 w-7 rounded-full border border-white/25 font-mono leading-none transition-colors hover:border-pink hover:text-pink"
                    >
                      &minus;
                    </button>
                    <button
                      type="button"
                      aria-label={t('increase')}
                      onClick={() => setQuantity(line.slug, line.quantity + 1)}
                      className="h-7 w-7 rounded-full border border-white/25 font-mono leading-none transition-colors hover:border-pink hover:text-pink"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      aria-label={t('remove')}
                      onClick={() => removeLine(line.slug)}
                      className="ml-1 font-mono text-xs uppercase text-cream transition-colors hover:text-pink"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-baseline justify-between border-t border-white/15 pt-4 font-mono text-sm tabular-nums">
              <span className="uppercase text-cream">{t('total')}</span>
              <span>{formatPrice(cartTotalCents(lines), locale)}</span>
            </p>

            {/* Only slugs and quantities are posted. The server resolves every
                price, so a tampered cart cannot change what is charged. */}
            <form action="/api/checkout" method="post" className="mt-5">
              <input type="hidden" name="locale" value={locale} />
              <input
                type="hidden"
                name="items"
                value={lines.map((line) => `${line.slug}:${line.quantity}`).join(',')}
              />
              <button
                type="submit"
                className="w-full rounded-[20px] bg-white px-6 py-3 font-display text-lg uppercase leading-none text-black transition-colors duration-200 hover:text-pink"
              >
                {t('checkout')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
