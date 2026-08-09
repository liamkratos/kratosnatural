import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getGuide} from '@/lib/guides';
import Container from '@/components/Container';
import Card from '@/components/Card';

type PageParams = {params: {locale: string; slug: string}};

/**
 * Nothing here should ever be indexed or linked to: it is only reachable after
 * paying, and a crawler that found it would be reporting a page that means
 * nothing without the purchase behind it.
 */
export const metadata: Metadata = {robots: {index: false, follow: false}};

export default async function GuideSuccessPage({
  params: {locale, slug}
}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const guide = await getGuide(locale, slug);
  if (!guide) notFound();

  const t = await getTranslations('Guides');

  return (
    <Container className="max-w-3xl py-24">
      <Card>
        <h1 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-5xl">
          {t('successTitle')}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl leading-snug text-black">
          {t('successIntro', {title: guide.title})}
        </p>

        {/* The download is not linked directly from here. The file is handed
            over by `api/download`, which checks ownership against Stripe on
            every request, and that check needs a signed-in session — which the
            buyer may not have yet in this browser. Sending them to the account
            page is the honest route: sign in with the address you paid with,
            and the file is there, now and in a year. */}
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
          {t('successDownload')}
        </p>

        {/* Confirming the waiver back to the buyer, in the same words they
            agreed to. Stated unconditionally rather than looked up: checkout
            refuses to sell without the waiver, so a purchase that reached this
            page can only have been made with it. */}
        <p className="mx-auto mt-6 max-w-2xl border-t border-ink/10 pt-6 font-mono text-xs uppercase leading-relaxed tracking-widest text-black">
          {t('withdrawalWaived')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/account"
            className="rounded-[20px] bg-olive px-7 py-4 font-display text-lg uppercase leading-none text-white transition-colors duration-200 hover:bg-oliveSoft"
          >
            {t('successAccount')}
          </Link>
          <Link
            href="/guides"
            className="rounded-[20px] border-2 border-olive px-7 py-4 font-display text-lg uppercase leading-none text-olive transition-colors duration-200 hover:bg-olive hover:text-white"
          >
            {t('successBack')}
          </Link>
        </div>
      </Card>
    </Container>
  );
}
