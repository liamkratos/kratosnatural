import type {Locale} from '@/i18n/routing';

/** Join conditional class names. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/** Format an ISO date for display in the given locale. */
export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Amsterdam'
  }).format(new Date(date));
}

/** Format an amount in euro cents for display. */
export function formatPrice(amountInCents: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', {
    style: 'currency',
    currency: 'EUR'
  }).format(amountInCents / 100);
}
