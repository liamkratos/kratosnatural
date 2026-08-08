import type Stripe from 'stripe';

/**
 * Where we are allowed to sell, and where we have chosen to.
 *
 * Two separate questions, deliberately kept apart, because conflating them is
 * how something ends up on sale in a country it was never cleared for:
 *
 *   1. **Permission** — may this specific product legally be sold there? A
 *      near-infrared lamp carrying therapeutic claims is a regulated device in
 *      some markets and a lamp in others. That answer belongs to the product,
 *      and it is declared per product in its own frontmatter.
 *
 *   2. **Rollout** — is that market open for business yet? One answer for the
 *      whole site, moved one step at a time: Netherlands, then the EU, then the
 *      UK, then the US, then the rest of the world.
 *
 * A product is sellable into a country only when both say yes. The default is
 * always the narrower of the two, so forgetting to widen something fails
 * closed — nothing is ever offered somewhere by omission.
 */

export const MARKETS = ['NL', 'EU', 'UK', 'US'] as const;

export type MarketId = (typeof MARKETS)[number];

/**
 * The rollout, in order. Each step is only opened once the one before it is
 * finished — the site is optimised for one market at a time rather than being
 * half-right in four.
 */
export const MARKET_SEQUENCE: readonly MarketId[] = MARKETS;

/**
 * Markets currently open for business.
 *
 * This is the switch. Everything else in the codebase reads it rather than
 * hard-coding a country list, so opening the EU is a one-line change here plus
 * clearing each product for `EU` in its frontmatter.
 *
 * Launch state: the Netherlands only.
 */
export const OPEN_MARKETS: readonly MarketId[] = ['NL'];

/**
 * ISO 3166-1 alpha-2 codes per market.
 *
 * `EU` is all 27 member states including the Netherlands, so a product cleared
 * for `EU` does not also need `NL` spelled out. The overlap is resolved by
 * taking a union, not by requiring the lists to be disjoint.
 */
const COUNTRIES: Record<MarketId, readonly ShippingCountry[]> = {
  NL: ['NL'],
  EU: [
    'AT',
    'BE',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'HU',
    'IE',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'NL',
    'PL',
    'PT',
    'RO',
    'SK',
    'SI',
    'ES',
    'SE'
  ],
  UK: ['GB'],
  US: ['US']
};

export function isMarketId(value: string): value is MarketId {
  return (MARKETS as readonly string[]).includes(value);
}

/**
 * Validates a `markets` frontmatter list, failing the build on anything unknown.
 *
 * An unrecognised market id would otherwise be silently dropped, and a product
 * that quietly lost a market is far harder to notice than one that refused to
 * build.
 */
export function parseMarkets(value: unknown, ref: string): MarketId[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(
      `"${ref}" must declare a non-empty "markets" list. Every product states where it has been cleared for sale — there is no default, because a default would be a guess about a legal question.`
    );
  }

  return value.map((entry) => {
    const id = String(entry);
    if (!isMarketId(id)) {
      throw new Error(
        `"${ref}": unknown market "${id}". Valid ids: ${MARKETS.join(', ')}.`
      );
    }
    return id;
  });
}

/**
 * Stripe's own country enum for shipping.
 *
 * Aliased rather than re-typed as `string[]`: Stripe validates the list, and
 * borrowing its type means a typo in the tables above is a compile error here
 * instead of a rejected Checkout session in front of a paying customer.
 */
export type ShippingCountry = NonNullable<
  Stripe.Checkout.SessionCreateParams.ShippingAddressCollection['allowed_countries']
>[number];

/** The countries a set of markets covers, deduplicated and sorted. */
export function countriesFor(markets: readonly MarketId[]): ShippingCountry[] {
  const codes = new Set<ShippingCountry>();
  for (const market of markets) {
    for (const code of COUNTRIES[market]) codes.add(code);
  }
  return [...codes].sort();
}

/**
 * Where this thing may actually be bought right now: cleared **and** open.
 *
 * Returns an empty array when the two do not overlap, which is a meaningful
 * answer rather than an error — a product cleared only for the US is simply not
 * on sale yet, and the shop should say so rather than break.
 */
export function sellableCountries(
  permitted: readonly MarketId[]
): ShippingCountry[] {
  const open = permitted.filter((market) => OPEN_MARKETS.includes(market));
  return countriesFor(open);
}

/** Whether anything can be sold to this country today. */
export function isSellable(permitted: readonly MarketId[]): boolean {
  return sellableCountries(permitted).length > 0;
}

/**
 * The countries a whole basket can ship to: every line has to be allowed.
 *
 * The intersection rather than the union. A cart holding one EU-wide product
 * and one cleared only for the Netherlands can only be delivered to the
 * Netherlands, and offering the buyer a German address would fail at the far
 * end of a payment rather than before it.
 */
export function sellableCountriesForAll(
  permittedPerItem: ReadonlyArray<readonly MarketId[]>
): ShippingCountry[] {
  if (permittedPerItem.length === 0) return [];

  return permittedPerItem
    .map((permitted) => sellableCountries(permitted))
    .reduce((left, right) => left.filter((code) => right.includes(code)));
}
