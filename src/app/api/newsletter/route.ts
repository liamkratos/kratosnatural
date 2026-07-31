import {NextResponse} from 'next/server';
import {addSubscriber, sendEbook} from '@/lib/email';
import {isLocale} from '@/i18n/routing';

/**
 * Newsletter signup.
 *
 * Accepts a plain form post, so it works without JavaScript, and answers with a
 * redirect back to the page the visitor was on. The origin is taken from the
 * request rather than from configuration, so a preview deployment links to the
 * guide on itself instead of on production.
 *
 * The address goes onto the Resend audience and the guide is sent. The order
 * matters: storing first means a send that fails still leaves a subscriber who
 * can be reached, whereas sending first and failing to store would give someone
 * the guide while silently dropping them from the list they asked to join.
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
    await addSubscriber(email);
    await sendEbook({to: email, origin, locale});
  } catch {
    // The address is never echoed back into the response.
    return redirect('error');
  }

  return redirect('ok');
}
