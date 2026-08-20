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

  /*
   * Four top-level destinations, not six.
   *
   * The guides belong under the shop because they are things you buy, and the
   * manifest belongs under the mission because it is what the mission says at
   * length. Both were briefly top-level, which made the bar read as a list of
   * pages rather than as a shape somebody could hold in their head.
   *
   * A child is reachable in its own right — every parent is still a real link
   * to a real page, and the submenu is an extra way in rather than the only
   * one.
   */
  const navItems: Array<{
    href: string;
    label: string;
    children?: Array<{href: string; label: string}>;
  }> = [
    {href: '/', label: t('Nav.home')},
    {
      href: '/shop',
      label: t('Nav.shop'),
      children: [{href: '/guides', label: t('Nav.guides')}]
    },
    {href: '/articles', label: t('Nav.articles')},
    {
      href: '/about',
      label: t('Nav.about'),
      children: [{href: '/plan', label: t('Nav.plan')}]
    }
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
          <p className="border-b-2 border-olive bg-white px-4 py-2 text-center text-sm leading-none tracking-wide text-ink">
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
            'mx-auto flex items-center justify-between gap-6 bg-olive px-5 py-2.5 text-white transition-[border-radius,max-width,box-shadow] duration-300 ease-out sm:px-7',
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

          {/* Desktop only. Below md the drawer below renders the same tree
              with the children nested, so no dropdown ever has to survive a
              touchscreen — which is where a hover menu gets stuck open. */}
          <nav className="hidden items-center gap-7 font-display text-xl uppercase leading-none md:flex">
            {navItems.map((item) => (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="block py-2 transition-colors duration-200 hover:text-pink"
                >
                  {item.label}
                </Link>

                {item.children && (
                  /* Opens on hover and on keyboard focus, so it is reachable
                     without a pointer. The parent stays a link in its own
                     right; this is a shortcut, not the only way in. */
                  <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-1 opacity-0 transition-opacity duration-200 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
                    <ul className="min-w-[12rem] rounded-[20px] bg-olive p-2 text-base shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block whitespace-nowrap rounded-[14px] px-4 py-2.5 text-center transition-colors duration-200 hover:text-pink"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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

        {/* A black panel carrying white buttons, so the items read as
            controls sitting on the menu rather than as four separate cards
            floating over the page. */}
        <nav
          id="mobile-nav"
          aria-label={t('Nav.menu')}
          className={cn(
            'absolute inset-x-3 top-full z-50 mt-2 rounded-[20px] bg-olive p-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-opacity duration-200 md:hidden',
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          {/* Children are listed under their parent rather than hidden behind
              a tap: a drawer has the room, and a second level of tapping to
              reach two pages would be ceremony for its own sake. */}
          <ul className="flex flex-col gap-2 font-display text-2xl uppercase leading-none">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-[20px] bg-white px-5 py-4 text-center text-black transition-colors duration-200 hover:text-olive"
                >
                  {item.label}
                </Link>

                {item.children && (
                  <ul className="mt-2 flex flex-col gap-2 pl-6">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-[20px] border border-white/30 px-5 py-3 text-center text-xl text-white transition-colors duration-200 hover:text-pink"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
