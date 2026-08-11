import {NextResponse} from 'next/server';
import {headers} from 'next/headers';
import {getStripe} from '@/lib/stripe';
import {SITE} from '@/lib/orders';
import {getGuide, findGuide} from '@/lib/guides';
import {sendGuideReceipt} from '@/lib/email';
import {isLocale, defaultLocale} from '@/i18n/routing';

/**
 * Stripe webhook: confirms a guide purchase once the money is actually in.
 *
 * This lives in a webhook rather than on the success page because the success
 * page is a browser landing — the buyer may close the tab, lose signal, or
 * reload it five times, and none of those should decide whether the mail goes
 * out or how many copies do. Stripe calls this once, retries on its own if we
 * are down, and knows nothing about what the browser did.
 *
 * That matters more than usual here: the mail is not only a courtesy, it is the
 * durable-medium record of the withdrawal waiver. A confirmation that depends
 * on the buyer keeping a tab open is not a record of anything.
 *
 * The signature check is the security boundary. Without it this endpoint would
 * take anyone's word for it that a payment happened.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set; webhook ignored.');
    return NextResponse.json({error: 'Not configured.'}, {status: 500});
  }

  const signature = headers().get('stripe-signature');
  const body = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature ?? '', secret);
  } catch (error) {
    console.error('webhook signature check failed', error);
    return NextResponse.json({error: 'Bad signature.'}, {status: 400});
  }

  if (event.type !== 'checkout.session.completed') {
    // Acknowledged, so Stripe stops retrying an event we simply do not act on.
    return NextResponse.json({received: true});
  }

  const session = event.data.object;
  if (session.payment_status !== 'paid') {
    return NextResponse.json({received: true});
  }

  try {
    // The site, the guide and the waiver were written onto the payment intent
    // at checkout, so that is where they are read from. A lamp order carries no
    // `guide` and falls through here untouched — it needs no download and no
    // waiver, because a parcel can be sent back.
    const intentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;
    if (!intentId) return NextResponse.json({received: true});

    const intent = await getStripe().paymentIntents.retrieve(intentId);
    const metadata = (intent.metadata ?? {}) as Record<string, string>;
    if (metadata.site !== SITE || !metadata.guide) {
      return NextResponse.json({received: true});
    }

    const email = session.customer_details?.email;
    if (!email) {
      console.error('paid guide session without an email', session.id);
      return NextResponse.json({received: true});
    }

    // Resolve the guide in the language the buyer checked out in, so the title
    // in the receipt is the one they saw on the page. `findGuide` is the
    // fallback for a guide that exists in only one language.
    const locale =
      session.locale && isLocale(session.locale)
        ? session.locale
        : defaultLocale;
    const guide =
      (await getGuide(locale, metadata.guide)) ??
      (await findGuide(metadata.guide));

    if (!guide) {
      console.error('paid guide session for an unknown slug', metadata.guide);
      return NextResponse.json({received: true});
    }

    await sendGuideReceipt({
      to: email,
      origin: new URL(request.url).origin,
      locale,
      title: guide.title,
      // The moment the waiver was given, recorded at checkout. Falls back to
      // the payment's own timestamp rather than to "now": the mail may be a
      // retry hours later, and a confirmation that misstates when consent was
      // given is worse than one that rounds to the payment.
      purchasedAt:
        metadata.withdrawal_waiver_at ||
        new Date(intent.created * 1000).toISOString()
    });
  } catch (error) {
    // A 500 tells Stripe to retry, which is what we want: the buyer has paid
    // and is owed both the file and the record.
    console.error('guide confirmation failed', error);
    return NextResponse.json({error: 'Confirmation failed.'}, {status: 500});
  }

  return NextResponse.json({received: true});
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
