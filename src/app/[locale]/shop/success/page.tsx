import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import Container from '@/components/Container';

/**
 * Post-checkout confirmation.
 *
 * Deliberately does not read the session id to display order details: the
 * fulfilment record is Stripe's, and reading it here would mean trusting a
 * session id from the URL. The buyer sees confirmation, and the real order
 * appears in their account once Stripe has processed it.
 */
export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Shop');

  return (
    <Container className="max-w-2xl py-32">
      <h1 className="font-display text-5xl font-bold uppercase leading-tight">
        {t('successTitle')}
      </h1>
      <p className="mx-auto mt-6 max-w-xl font-display text-xl uppercase leading-snug text-ink/70">
        {t('successIntro')}
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/account"
          className="rounded-[20px] bg-black px-8 py-4 font-display text-xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink"
        >
          {t('viewAccount')}
        </Link>
        <Link
          href="/shop"
          className="font-display text-xl uppercase leading-none text-ink/60 underline underline-offset-4 transition-colors duration-200 hover:text-pink"
        >
          {t('backToShop')}
        </Link>
      </div>
    </Container>
  );
}
