/**
 * Cart storage.
 *
 * The cart lives in the browser only. Nothing is written to a server, which
 * keeps it consistent with the rest of the site: Stripe holds the money, this
 * app holds as little personal data as it can.
 *
 * The stored amounts are for display only. Checkout sends slugs and quantities,
 * never prices, and the server re-resolves every price from the product's own
 * content file — so editing localStorage cannot buy a lamp for a euro.
 */
export const CART_STORAGE_KEY = 'kn_cart';
export const CART_EVENT = 'kn_cart_change';

export type CartLine = {
  slug: string;
  title: string;
  /** Display price at the time it was added; re-resolved server-side. */
  amountCents: number;
  currency: string;
  image?: string;
  quantity: number;
};

function isCartLine(value: unknown): value is CartLine {
  const line = value as Partial<CartLine>;
  return (
    typeof line?.slug === 'string' &&
    typeof line.title === 'string' &&
    typeof line.amountCents === 'number' &&
    typeof line.quantity === 'number' &&
    line.quantity > 0
  );
}

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Anything malformed is discarded rather than crashing the header.
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing can refuse writes; the cart just will not persist.
  }
  // Notifies every listener in this tab. `storage` only fires in *other* tabs,
  // so the header would otherwise not update after adding from a product page.
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addLine(line: Omit<CartLine, 'quantity'>, quantity = 1) {
  const lines = readCart();
  const existing = lines.find((entry) => entry.slug === line.slug);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 10);
  } else {
    lines.push({...line, quantity: Math.min(quantity, 10)});
  }

  writeCart(lines);
}

export function setQuantity(slug: string, quantity: number) {
  const lines = readCart()
    .map((line) =>
      line.slug === slug
        ? {...line, quantity: Math.max(0, Math.min(quantity, 10))}
        : line
    )
    .filter((line) => line.quantity > 0);
  writeCart(lines);
}

export function removeLine(slug: string) {
  writeCart(readCart().filter((line) => line.slug !== slug));
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartTotalCents(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.amountCents * line.quantity, 0);
}
