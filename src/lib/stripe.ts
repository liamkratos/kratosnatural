import 'server-only';
import Stripe from 'stripe';

/**
 * Server-side Stripe client.
 *
 * Lazily constructed so that importing this module (e.g. for its types) does not
 * throw during a build where STRIPE_SECRET_KEY is not present.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Copy .env.example to .env.local and fill it in.'
    );
  }

  client = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
    appInfo: {name: 'Kratos Natural', url: 'https://kratosnatural.com'}
  });

  return client;
}

/** Currency and Stripe locale to use per site locale. */
export const stripeLocaleConfig = {
  en: {currency: 'eur', locale: 'en' as const},
  nl: {currency: 'eur', locale: 'nl' as const}
};

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set.');
  return secret;
}
