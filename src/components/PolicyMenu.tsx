'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

/**
 * The policy list in the footer.
 *
 * A real button rather than a hover target. Hover has no equivalent on a
 * touchscreen: the previous version expanded only on `:hover`, which phones
 * emulate on tap and then leave stuck, so the list would open, stay open over
 * the next thing tapped, and refuse to close. A button works the same for
 * mouse, keyboard and finger.
 *
 * Hover still opens it on pointer devices, so the desktop behaviour is intact.
 */
export default function PolicyMenu({policies}: {policies: readonly string[]}) {
  const t = useTranslations('Footer');
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="footer-policies"
        className="font-display text-lg uppercase leading-none transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
      >
        {t('policies')}
      </button>

      {/* Animating grid-template-rows keeps it smooth without a fixed height
          and without pushing layout when closed. */}
      <ul
        id="footer-policies"
        className={cn(
          'grid overflow-hidden text-sm transition-[grid-template-rows] duration-300 ease-out md:group-hover:grid-rows-[1fr]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <li className="min-h-0">
          <ul className="space-y-2 pt-4 text-center">
            {policies.map((key) => (
              <li key={key}>
                <Link
                  href={`/${key}`}
                  className="font-display uppercase tracking-wide text-white transition-colors duration-200 hover:text-pink"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
