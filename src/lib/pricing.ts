import 'server-only';
import {cache} from 'react';
import {getStripe} from '@/lib/stripe';

/**
 * Live price lookup.
 *
 * Wrapped in React's `cache` so a page rendering a grid of products hits Stripe
 * once per price per request rather than once per component.
 *
 * A price that cannot be fetched returns null rather than throwing: a Stripe
 * outage should leave the shop browsable with the buy button disabled, not take
 * the whole page down.
 */
export type PriceInfo = {
  id: string;
  amountCents: number;
  currency: string;
  /** True when the displayed amount already contains VAT. */
  taxInclusive: boolean;
  active: boolean;
};

export const getPrice = cache(async (priceId: string): Promise<PriceInfo | null> => {
  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (price.unit_amount === null) return null;

    return {
      id: price.id,
      amountCents: price.unit_amount,
      currency: price.currency,
      taxInclusive: price.tax_behavior === 'inclusive',
      active: price.active
    };
  } catch (error) {
    console.error(`could not load price ${priceId}`, error);
    return null;
  }
});
