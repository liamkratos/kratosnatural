import {NextResponse} from 'next/server';
import {sendEbook} from '@/lib/email';
import {isLocale} from '@/i18n/routing';

/**
 * Newsletter signup.
 *
 * Accepts a plain form post, so it works without JavaScript, and answers with a
 * redirect back to the page the visitor was on. The origin is taken from the
 * request rather than from configuration, so a preview deployment links to the
 * guide on itself instead of on production.
 *
 * No list is stored yet: this sends the guide and nothing else. Storing
 * addresses means a subscriber record, an unsubscribe route and a retention
 * policy, none of which exist, and collecting them without those would be worse
 * than not collecting them at all.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const localeInput = String(form.get('locale') ?? '');
  const locale = isLocale(localeInput) ? localeInput : 'en';
  const back = String(form.get('next') ?? '/');

  const origin = new URL(request.url).origin;
  const redirect = (status: 'ok' | 'error') =>
    NextResponse.redirect(
      new URL(`${back}${back.includes('?') ? '&' : '?'}newsletter=${status}`, origin),
      {status: 303}
    );

  // Deliberately permissive: an address that looks wrong here is far more
  // likely to be a typo than an attack, and Resend rejects what it cannot send.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return redirect('error');

  try {
    await sendEbook({to: email, origin, locale});
  } catch {
    // The address is never echoed back into the response.
    return redirect('error');
  }

  return redirect('ok');
}
