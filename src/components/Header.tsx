'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import CartButton from '@/components/CartButton';
import {useScrolled} from '@/lib/use-scrolled';
import {cn} from '@/lib/utils';

/**
 * Floating navigation bar.
 *
 * The bar carries the same 20px radius as the buttons, sits inset from the page
 * edges so it reads as a detached object rather than a full-width band, and is
 * sticky so it pins once the hero scrolls past.
 *
 * On scroll the announcement strip above it collapses, leaving the bar floating
 * on its own. The strip animates grid-template-rows rather than height, so it
 * collapses smoothly without a hard-coded height and without shifting layout.
 */
export default function Header({locale}: {locale: Locale}) {
  const t = useTranslations();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  // Below md the nav collapses into a drawer. Closing on route change matters:
  // Next.js does not remount the header between pages, so without this the
  // drawer would stay open over the page the visitor just asked for.
  const pathname = usePathname();
  useEffect(() => setMenuOpen(false), [pathname]);

  const navItems = [
    {href: '/', label: t('Nav.home')},
    {href: '/shop', label: t('Nav.shop')},
    {href: '/articles', label: t('Nav.articles')},
    {href: '/about', label: t('Nav.about')}
  ];

  return (
    <div className="sticky top-0 z-50">
      <div
        aria-hidden={scrolled}
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out',
          scrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        )}
      >
        <div className="min-h-0">
          <p className="border-b-2 border-pink bg-white px-4 py-2 text-center font-display text-sm uppercase leading-none tracking-wide text-ink">
            {t('Site.announcement')}
          </p>
        </div>
      </div>

      {/* Square and edge-to-edge at rest; becomes an inset pill once scrolled. */}
      <div
        className={cn(
          'relative transition-[padding] duration-300 ease-out',
          scrolled ? 'px-3 pt-3 sm:px-5' : 'px-0 pt-0'
        )}
      >
        <header
          className={cn(
            'mx-auto flex items-center justify-between gap-6 bg-black px-5 py-2.5 text-cream transition-[border-radius,max-width,box-shadow] duration-300 ease-out sm:px-7',
            scrolled
              ? 'max-w-6xl rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
              : 'max-w-none rounded-none shadow-none'
          )}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={t('Nav.menu')}
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className="h-6 w-6"
            >
              {menuOpen ? (
                <>
                  <path d="M5 5l14 14" />
                  <path d="M19 5L5 19" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>

          <Link href="/" className="shrink-0" aria-label={t('Site.name')}>
            {/* Intrinsic 1000x380 after cropping the source's empty canvas. */}
            <Image
              src="/logo.png"
              alt={t('Site.name')}
              width={1000}
              height={380}
              priority
              className="h-9 w-auto md:h-10"
            />
          </Link>

          <nav className="hidden items-center gap-7 font-display text-xl uppercase leading-none md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors duration-200 hover:text-pink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <CartButton locale={locale} />

            {/* Icon-only, so it needs an accessible name of its own. */}
            <Link
              href="/account"
              aria-label={t('Nav.account')}
              title={t('Nav.account')}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
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
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
              </svg>
            </Link>

            <LocaleSwitcher current={locale} />
          </div>
        </header>

        {/* A floating panel, matching the cart: inset from the page edges,
            20px corners, its own shadow. An earlier version was a full-width
            strip welded under the bar, which read as part of the chrome rather
            than as something that had opened. */}
        <nav
          id="mobile-nav"
          aria-label={t('Nav.menu')}
          className={cn(
            'absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-[20px] bg-black py-2 text-center text-cream shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-opacity duration-200 md:hidden',
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <ul className="font-display text-2xl uppercase leading-none">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-5 py-4 transition-colors duration-200 hover:text-pink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
