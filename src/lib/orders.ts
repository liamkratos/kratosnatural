import 'server-only';
import {getStripe} from '@/lib/stripe';

/**
 * Order history read live from Stripe.
 *
 * Nothing is mirrored into a local database: Stripe stays the record of
 * customers, payments and shipping addresses, and this module reads it on
 * demand. That keeps the personal data this app stores down to an email address
 * in a signed cookie.
 *
 * Only one-off shop purchases are returned. Subscription and invoice payments
 * from the coaching site share this Stripe account and are excluded — see the
 * invoice filter below.
 *
 * Tracking is not a native Stripe field, so it is read from metadata that the
 * fulfilment step writes back onto the PaymentIntent:
 *
 *   metadata.carrier         "postnl" or "dhl"
 *   metadata.tracking_number e.g. "3SABCD1234567"
 *   metadata.shipped_at      ISO date, optional
 */

export type DeliveryState =
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type OrderLine = {
  description: string;
  quantity: number;
  amountCents: number;
};

export type Order = {
  id: string;
  /** Human-facing reference, shorter than the Stripe id. */
  reference: string;
  createdAt: string;
  amountCents: number;
  currency: string;
  state: DeliveryState;
  lines: OrderLine[];
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

/**
 * Carrier tracking URLs. Adding a carrier is a one-line change here rather than
 * a conditional scattered through the UI.
 */
const carriers: Record<string, {label: string; url: (code: string) => string}> = {
  postnl: {
    label: 'PostNL',
    url: (code) => `https://postnl.nl/tracktrace/?B=${encodeURIComponent(code)}`
  },
  dhl: {
    label: 'DHL',
    url: (code) =>
      `https://my.dhlecommerce.nl/home/tracktrace/${encodeURIComponent(code)}`
  }
};

export function carrierLabel(key: string | null): string | null {
  if (!key) return null;
  return carriers[key.toLowerCase()]?.label ?? key;
}

function trackingUrlFor(carrier: string | null, code: string | null) {
  if (!carrier || !code) return null;
  return carriers[carrier.toLowerCase()]?.url(code) ?? null;
}

function deliveryState(
  status: string,
  refunded: boolean,
  metadata: Record<string, string>
): DeliveryState {
  if (refunded) return 'refunded';
  if (status === 'canceled') return 'cancelled';
  if (metadata.delivered_at) return 'delivered';
  if (metadata.tracking_number) return 'shipped';
  return 'processing';
}

/**
 * All orders for an email address, newest first.
 * Returns an empty array when the address has never bought anything.
 */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const stripe = getStripe();

  const customers = await stripe.customers.list({email, limit: 10});
  if (customers.data.length === 0) return [];

  const perCustomer = await Promise.all(
    customers.data.map(async (customer) => {
      const intents = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 50,
        expand: ['data.latest_charge']
      });

      return intents.data
        .filter((intent) => intent.status !== 'canceled' || intent.amount > 0)
        // Shop orders only. One Stripe account serves both Kratos Natural and
        // the coaching subscriptions on liamkratos.com, and a subscription
        // charge is also a PaymentIntent — but it is attached to an invoice,
        // whereas a Checkout purchase is not. Without this, a customer who buys
        // a lamp and subscribes to coaching would see the coaching charges
        // listed here as orders, permanently stuck on "Processing" because no
        // tracking number will ever be written to them.
        .filter((intent) => intent.invoice === null)
        .map((intent): Order => {
          const metadata = (intent.metadata ?? {}) as Record<string, string>;
          const charge =
            typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
          const refunded = charge?.refunded ?? false;
          const carrier = metadata.carrier ?? null;
          const trackingNumber = metadata.tracking_number ?? null;

          return {
            id: intent.id,
            reference: intent.id.replace(/^pi_/, '').slice(0, 10).toUpperCase(),
            createdAt: new Date(intent.created * 1000).toISOString(),
            amountCents: intent.amount,
            currency: intent.currency,
            state: deliveryState(intent.status, refunded, metadata),
            lines: charge?.description
              ? [
                  {
                    description: charge.description,
                    quantity: 1,
                    amountCents: intent.amount
                  }
                ]
              : [],
            carrier,
            trackingNumber,
            trackingUrl: trackingUrlFor(carrier, trackingNumber)
          };
        });
    })
  );

  return perCustomer
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
