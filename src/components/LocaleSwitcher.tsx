'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {locales, localeDomains, type Locale} from '@/i18n/routing';
import {usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

/**
 * Country selector as a dropdown.
 *
 * Flags are inline SVG rather than emoji: emoji flags render differently on
 * every platform and are dropped entirely on some Windows builds. They are
 * clipped to a heart, and each option still carries a text label — a flag alone
 * is not an accessible name, and it also doesn't tell you which language it is.
 *
 * Switching locale is a cross-origin navigation because each locale lives on its
 * own domain, so the options are plain anchors rather than router pushes.
 */
const flags: Record<Locale, {node: React.ReactNode; country: string}> = {
  en: {
    country: 'United Kingdom',
    node: (
      <svg
        viewBox="0 0 60 30"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <clipPath id="uk-clip">
          <path d="M0 0v30h60V0z" />
        </clipPath>
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0 0l60 30m0-30L0 30"
          stroke="#C8102E"
          strokeWidth="4"
          clipPath="url(#uk-clip)"
        />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    )
  },
  nl: {
    country: 'Nederland',
    node: (
      <svg
        viewBox="0 0 9 6"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <rect width="9" height="6" fill="#21468B" />
        <rect width="9" height="4" fill="#FFF" />
        <rect width="9" height="2" fill="#AE1C28" />
      </svg>
    )
  }
};

function Heart({locale, className}: {locale: Locale; className?: string}) {
  return (
    <span
      style={{clipPath: 'url(#flag-heart)'}}
      className={cn('block h-6 w-7 shrink-0 overflow-hidden', className)}
    >
      {flags[locale].node}
    </span>
  );
}

export default function LocaleSwitcher({current}: {current: Locale}) {
  const t = useTranslations('LocaleSwitcher');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape, so the menu can never be left open
  // with no way back to the page.
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

  return (
    <div ref={ref} className="relative">
      {/* Heart mask, declared once and shared by every flag. Normalised
          coordinates, so it scales to whatever size the flag renders at. */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <clipPath id="flag-heart" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.95 C0.5,0.95 0.03,0.62 0.03,0.32 C0.03,0.13 0.19,0.02 0.33,0.02 C0.42,0.02 0.48,0.09 0.5,0.13 C0.52,0.09 0.58,0.02 0.67,0.02 C0.81,0.02 0.97,0.13 0.97,0.32 C0.97,0.62 0.5,0.95 0.5,0.95 Z" />
          </clipPath>
        </defs>
      </svg>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('label')}
        className="flex items-center gap-2 rounded-[20px] px-2 py-1.5 font-display text-lg uppercase leading-none transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
      >
        <Heart locale={current} />
        <span className="hidden sm:inline">{t(current)}</span>
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={cn(
            'h-2.5 w-2.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <ul
        role="menu"
        className={cn(
          'absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-[20px] bg-black py-2 text-left shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {locales.map((locale) => {
          const isCurrent = locale === current;
          const href = `${localeDomains[locale].replace(/\/$/, '')}${pathname}`;

          return (
            <li key={locale} role="none">
              <a
                role="menuitem"
                href={href}
                hrefLang={locale}
                aria-current={isCurrent ? 'true' : undefined}
                tabIndex={open ? 0 : -1}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 font-display text-lg uppercase leading-none transition-colors duration-200 hover:text-pink',
                  isCurrent ? 'text-pink' : 'text-cream'
                )}
              >
                <Heart locale={locale} className={cn(!isCurrent && 'opacity-70')} />
                <span>{t(locale)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
