'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import Container from '@/components/Container';

const SUBSCRIBED_KEY = 'kn_subscribed';

/**
 * Mailing-list strip, sitting directly on top of the footer on every page.
 *
 * Hidden once someone has signed up, so it stops nagging returning readers.
 * That state is a local flag, not an account: there is no server-side record of
 * who has subscribed, and clearing site data brings the strip back.
 *
 * Rendered on the server and hidden after mount rather than the reverse, so the
 * markup matches on hydration and the block does not flash in for readers who
 * have already signed up... which is why the hidden state is applied via a class
 * rather than by returning null.
 *
 * The form posts to /api/newsletter, which mails the free guide. It is a plain
 * form post rather than fetch, so it still works if the bundle fails to load;
 * the local flag is set optimistically on submit.
 */
export default function Newsletter() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const pathname = usePathname();
  const [status, setStatus] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  // Read from the URL after mount rather than with useSearchParams: that hook
  // opts the whole page out of static prerendering, and this block sits on
  // every page in the layout, so it would have taken all 39 of them with it.
  useEffect(() => {
    setStatus(new URLSearchParams(window.location.search).get('newsletter'));
  }, []);

  useEffect(() => {
    try {
      setSubscribed(window.localStorage.getItem(SUBSCRIBED_KEY) === '1');
    } catch {
      // Private browsing: treat as not subscribed.
    }
  }, []);

  // A failed send must bring the block back, otherwise the optimistic flag set
  // on submit would hide the only way to try again.
  useEffect(() => {
    if (status === 'error') {
      try {
        window.localStorage.removeItem(SUBSCRIBED_KEY);
      } catch {
        // Nothing to do.
      }
      setSubscribed(false);
    }
  }, [status]);

  if (subscribed && status !== 'error') {
    return status === 'ok' ? (
      <section className="floating mx-3 mt-3 bg-white py-12 text-ink sm:mx-5">
        <Container className="max-w-3xl">
          <h2 className="quoted font-display text-2xl font-bold uppercase leading-none sm:text-3xl">
            {t('newsletterThanksTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-display text-base uppercase leading-snug text-black sm:text-lg">
            {t('newsletterThanksBody')}
          </p>
        </Container>
      </section>
    ) : null;
  }

  return (
    <section className="floating mx-3 mt-3 bg-white py-12 text-ink sm:mx-5">
      <Container className="max-w-3xl">
        {/* Copy sits above the signup bar rather than beside it, so the block
            reads top to bottom on every width. */}
        <h2 className="quoted font-display text-2xl font-bold uppercase leading-none sm:text-3xl">
          {t('newsletterTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl font-display text-base uppercase leading-snug text-black sm:text-lg">
          {t('newsletterIntro')}
        </p>

        {status === 'error' && (
          <p
            role="alert"
            className="mx-auto mt-3 max-w-2xl font-display text-base uppercase leading-snug text-black"
          >
            {t('newsletterError')}
          </p>
        )}

        <form
          action="/api/newsletter"
          method="post"
          className="relative mx-auto mt-6 w-full max-w-lg"
          onSubmit={() => {
            try {
              window.localStorage.setItem(SUBSCRIBED_KEY, '1');
            } catch {
              // Nothing to do; the strip simply stays visible.
            }
          }}
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={pathname} />
          <label htmlFor="newsletter-email" className="sr-only">
            {t('emailLabel')}
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className="w-full rounded-[20px] border border-ink/25 bg-transparent py-3 pl-5 pr-40 text-center font-display text-base uppercase text-ink placeholder:text-black focus:border-pink focus:outline-none"
          />
          <button
            type="submit"
            className="absolute inset-y-1 right-1 rounded-[16px] bg-black px-5 font-display text-base uppercase leading-none text-white transition-colors duration-200 hover:text-pink"
          >
            {t('subscribe')}
          </button>
        </form>
      </Container>
    </section>
  );
}
