import 'server-only';
import {getStripe} from '@/lib/stripe';
import {SITE} from '@/lib/orders';

/**
 * Who owns which guide.
 *
 * Stripe is the record, exactly as it is for orders: there is no local table of
 * purchases to fall out of sync with it. A completed payment carrying the right
 * metadata *is* the licence, so a refund or a reversal removes access without
 * anything here needing to know that happened.
 *
 * Checkout writes the slug onto the PaymentIntent:
 *
 *   metadata.site   "kratosnatural"
 *   metadata.guide  the guide slug, e.g. "houding-schouders"
 *
 * A guide bought on liamkratos carries `site: "liamkratos"` and is deliberately
 * not honoured here. The two sites sell the same library but keep separate
 * books, and silently accepting the other site's purchases would make the
 * revenue split unknowable.
 */

/** Every guide slug this email address has paid for. */
export async function getOwnedGuides(email: string): Promise<Set<string>> {
  const stripe = getStripe();
  const owned = new Set<string>();

  const customers = await stripe.customers.list({email, limit: 10});
  if (customers.data.length === 0) return owned;

  const perCustomer = await Promise.all(
    customers.data.map((customer) =>
      stripe.paymentIntents.list({
        customer: customer.id,
        limit: 50,
        expand: ['data.latest_charge']
      })
    )
  );

  for (const intent of perCustomer.flatMap((page) => page.data)) {
    const metadata = (intent.metadata ?? {}) as Record<string, string>;
    if (metadata.site !== SITE || !metadata.guide) continue;

    // Only a payment that actually went through and stayed through. A refunded
    // purchase is not a licence, and neither is one still awaiting a bank.
    if (intent.status !== 'succeeded') continue;
    const charge =
      typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
    if (charge?.refunded) continue;

    owned.add(metadata.guide);
  }

  return owned;
}

/** Whether this email address may download this guide. */
export async function ownsGuide(email: string, slug: string): Promise<boolean> {
  return (await getOwnedGuides(email)).has(slug);
}
