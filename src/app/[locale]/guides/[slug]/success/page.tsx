import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getGuide} from '@/lib/guides';
import {getStripe} from '@/lib/stripe';
import Container from '@/components/Container';
import Card from '@/components/Card';

type PageParams = {
  params: {locale: string; slug: string};
  searchParams: {session_id?: string};
};

/**
 * Whether this purchase waived the 14-day right of withdrawal.
 *
 * The shop's own confirmation page deliberately does not read the session id,
 * on the grounds that it would mean trusting a value from the URL to display
 * order details. This one does, and the reason is the difference between the
 * two pages: what is shown here is a statement about what the buyer just
 * agreed to give up, and telling somebody they waived a consumer right when
 * they did not is worse than the small exposure of reading one boolean against
 * an unguessable id. Nothing personal is displayed either way.
 *
 * A failure returns null and the page simply says nothing about it, rather
 * than guessing.
 */
async function readWaiver(sessionId?: string): Promise<boolean | null> {
  if (!sessionId) return null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });
    const intent = session.payment_intent;
    if (!intent || typeof intent === 'string') return null;
    return intent.metadata?.withdrawal_waiver === 'granted';
  } catch (error) {
    console.error('could not read withdrawal waiver', error);
    return null;
  }
}

/**
 * Nothing here should ever be indexed or linked to: it is only reachable after
 * paying, and a crawler that found it would be reporting a page that means
 * nothing without the purchase behind it.
 */
export const metadata: Metadata = {robots: {index: false, follow: false}};

export default async function GuideSuccessPage({
  params: {locale, slug},
  searchParams
}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const guide = await getGuide(locale, slug);
  if (!guide) notFound();

  const t = await getTranslations('Guides');
  const waived = await readWaiver(searchParams.session_id);

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
            agreed to. Somebody who did not waive is told they kept the right
            rather than being left to guess — the sale went through either way,
            and the difference is only how long they can change their mind. */}
        {waived !== null && (
          <p className="mx-auto mt-6 max-w-2xl border-t border-ink/10 pt-6 font-mono text-xs uppercase leading-relaxed tracking-widest text-black">
            {waived ? t('withdrawalWaived') : t('withdrawalKept')}
          </p>
        )}

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
