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
/** Heart outline, in the same 0-100 space the flags are drawn into. */
const HEART_PATH =
  'M50,95 C50,95 3,62 3,32 C3,13 19,2 33,2 C42,2 48,9 50,13 C52,9 58,2 67,2 C81,2 97,13 97,32 C97,62 50,95 50,95 Z';

/**
 * Flag artwork, drawn edge-to-edge into a 0-100 box. Each is a nested <svg> so
 * its own aspect ratio is stretched to fill the heart rather than letterboxed.
 */
const flags: Record<Locale, {node: React.ReactNode; country: string}> = {
  en: {
    country: 'United Kingdom',
    node: (
      <svg
        viewBox="0 0 60 30"
        preserveAspectRatio="none"
        width="100"
        height="100"
      >
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0 0l60 30m0-30L0 30"
          stroke="#C8102E"
          strokeWidth="4"
          clipPath="url(#uk-diagonals)"
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
        width="100"
        height="100"
      >
        <rect width="9" height="6" fill="#21468B" />
        <rect width="9" height="4" fill="#FFF" />
        <rect width="9" height="2" fill="#AE1C28" />
      </svg>
    )
  }
};

/**
 * One heart: the flag clipped to the heart, with a white outline stroked on top.
 *
 * The outline has to be an SVG path rather than a CSS border — a border follows
 * the element's box, not its clip-path, so it would draw a rectangle around the
 * heart. Stroking the same path used for the clip keeps the two exactly aligned.
 * The stroke sits outside the clipped group so it is not itself clipped away.
 */
function Heart({locale, className}: {locale: Locale; className?: string}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="presentation"
      className={cn('block h-6 w-7 shrink-0 overflow-visible', className)}
    >
      <g clipPath="url(#flag-heart)">{flags[locale].node}</g>
      <path
        d={HEART_PATH}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
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
      {/* Declared once and shared by every heart. Ids must be unique per
          document, so they cannot live inside the repeated flag markup. */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <clipPath id="flag-heart">
            <path d={HEART_PATH} />
          </clipPath>
          <clipPath id="uk-diagonals">
            <path d="M0 0v30h60V0z" />
          </clipPath>
        </defs>
      </svg>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('label')}
        className="flex items-center gap-2 rounded-[20px] px-2 py-1.5 font-display text-lg uppercase leading-none transition-colors duration-200 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
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
          'absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-[20px] bg-olive py-2 text-left shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-opacity duration-200',
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
                  'flex items-center gap-3 px-4 py-2.5 font-display text-lg uppercase leading-none transition-colors duration-200 hover:text-cream',
                  isCurrent ? 'text-cream' : 'text-cream'
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
