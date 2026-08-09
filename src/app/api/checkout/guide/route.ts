import {NextResponse} from 'next/server';
import {getStripe} from '@/lib/stripe';
import {SITE} from '@/lib/orders';
import {findGuide} from '@/lib/guides';
import {isLocale, defaultLocale} from '@/i18n/routing';

/**
 * Creates a Stripe Checkout session for one guide.
 *
 * Separate from `api/checkout` because the two sell different kinds of thing.
 * A lamp needs a shipping address and adjustable quantities; a PDF needs
 * neither, and asking a buyer for a delivery address for a download is the kind
 * of small dishonesty that costs more trust than it saves code.
 *
 * The browser sends a slug, never a price or an amount. The slug is resolved
 * against the guides on disk and the price is read from that file, so a crafted
 * request can at worst ask to buy a guide that exists, at its real price.
 *
 * The billing address is still collected, because VAT on a digital product in
 * the EU follows the buyer's country and `automatic_tax` needs somewhere to
 * work that out from.
 */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const form = await request.formData().catch(() => null);
  const rawLocale = String(form?.get('locale') ?? '');
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const slug = String(form?.get('slug') ?? '');

  const guide = await findGuide(slug);
  const back = guide
    ? `${origin}${prefix}/guides/${guide.slug}?checkout=error`
    : `${origin}${prefix}/guides`;

  if (!guide) return NextResponse.redirect(back, {status: 303});

  /*
   * No waiver, no sale.
   *
   * The checkbox on the page carries `required`, so a browser will not submit
   * without it — but a form can be posted directly, and the whole value of the
   * waiver is that it is a record of something the buyer actually did. Taking
   * it on trust would mean recording a consent that may never have been given,
   * which is worse than not recording one at all.
   *
   * Selling anyway and quietly keeping the 14-day right would mean shipping a
   * file that can be kept and refunded in full. There is no version of that
   * which is fair to either side, so the checkout stops here instead and sends
   * the buyer back to tick the box.
   */
  if (String(form?.get('withdrawalWaiver') ?? '') !== 'granted') {
    return NextResponse.redirect(
      `${origin}${prefix}/guides/${guide.slug}?checkout=waiver`,
      {status: 303}
    );
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{price: guide.priceId, quantity: 1}],
      automatic_tax: {enabled: true},
      billing_address_collection: 'required',
      // Attaches the purchase to a customer by email, which is what lets the
      // account page find it again and hand over the download.
      customer_creation: 'always',
      // The licence, in two fields: which site sold it and which guide it was.
      // On the payment intent rather than the session, because that is what
      // both the account page and the entitlement check read.
      //
      // The waiver rides along with it. Stripe's record of the payment is the
      // one place that outlives a session, a cookie and a redeploy, so if the
      // question is ever asked — did this person agree to lose their
      // withdrawal right, and when — the answer is stored next to the payment
      // it belongs to rather than in a table we would have to keep.
      payment_intent_data: {
        metadata: {
          site: SITE,
          guide: guide.slug,
          withdrawal_waiver: 'granted',
          withdrawal_waiver_at: new Date().toISOString()
        }
      },
      locale: locale === 'nl' ? 'nl' : 'en',
      success_url: `${origin}${prefix}/guides/${guide.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${prefix}/guides/${guide.slug}`
    });

    if (!session.url)
      throw new Error('Stripe returned a session without a URL.');
    return NextResponse.redirect(session.url, {status: 303});
  } catch (error) {
    console.error('guide checkout session failed', error);
    return NextResponse.redirect(back, {status: 303});
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
