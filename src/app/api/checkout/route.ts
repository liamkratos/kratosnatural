import {NextResponse} from 'next/server';
import {getStripe} from '@/lib/stripe';
import {getProduct} from '@/lib/products';
import {isLocale, defaultLocale} from '@/i18n/routing';

/**
 * Creates a Stripe Checkout session for one product.
 *
 * The client posts a slug, never a price or an amount. The price id is looked up
 * server-side from the product's own content file, so a crafted request cannot
 * substitute a cheaper price or a different product's price.
 *
 * Tax is computed by Stripe at checkout from the delivery address
 * (`automatic_tax`), which is why a shipping address is collected before payment
 * rather than after.
 */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const form = await request.formData();
    const slug = String(form.get('slug') ?? '');
    const rawLocale = String(form.get('locale') ?? '');
    const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
    const prefix = locale === defaultLocale ? '' : `/${locale}`;

    const product = await getProduct(locale, slug);
    if (!product) {
      return NextResponse.redirect(`${origin}${prefix}/shop`, {status: 303});
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{price: product.priceId, quantity: 1, adjustable_quantity: {enabled: true, minimum: 1, maximum: 10}}],
      // Stripe Tax needs a destination before it can pick a rate.
      automatic_tax: {enabled: true},
      shipping_address_collection: {allowed_countries: ['NL', 'BE', 'DE', 'FR', 'AT', 'ES', 'IT', 'IE', 'PT', 'LU', 'DK', 'SE', 'FI', 'PL']},
      billing_address_collection: 'auto',
      // Lets Stripe attach the purchase to an existing customer by email, which
      // is what makes it show up in the buyer's account page afterwards.
      customer_creation: 'always',
      locale: locale === 'nl' ? 'nl' : 'en',
      success_url: `${origin}${prefix}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${prefix}/shop/${slug}`
    });

    if (!session.url) throw new Error('Stripe returned a session without a URL.');
    return NextResponse.redirect(session.url, {status: 303});
  } catch (error) {
    console.error('checkout session failed', error);
    return NextResponse.redirect(`${origin}/shop?error=checkout`, {status: 303});
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
