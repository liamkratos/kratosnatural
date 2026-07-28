'use client';

import {useTranslations} from 'next-intl';
import {locales, localeDomains, type Locale} from '@/i18n/routing';
import {usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

/**
 * Each locale lives on its own domain, so switching language is a cross-origin
 * navigation — a plain anchor, not a client-side route change. The current
 * pathname is carried over to the other domain.
 */
export default function LocaleSwitcher({current}: {current: Locale}) {
  const t = useTranslations('LocaleSwitcher');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="flex items-center gap-2 text-sm">
      {locales.map((locale) => {
        const isCurrent = locale === current;
        const href = `${localeDomains[locale].replace(/\/$/, '')}${pathname}`;

        return isCurrent ? (
          <span
            key={locale}
            aria-current="true"
            className="font-medium text-kratos-900"
          >
            {t(locale)}
          </span>
        ) : (
          <a
            key={locale}
            href={href}
            hrefLang={locale}
            className={cn(
              'text-kratos-500 underline-offset-4 hover:underline',
              'focus-visible:outline-2 focus-visible:outline-offset-2'
            )}
          >
            {t(locale)}
          </a>
        );
      })}
    </nav>
  );
}
