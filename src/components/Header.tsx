'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    {href: '/', label: t('Nav.home')},
    {href: '/shop', label: t('Nav.shop')},
    {href: '/articles', label: t('Nav.articles')},
    {href: '/about', label: t('Nav.about')},
    {href: '/account', label: t('Nav.account')}
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
          'transition-[padding] duration-300 ease-out',
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

          <LocaleSwitcher current={locale} />
        </header>
      </div>
    </div>
  );
}
