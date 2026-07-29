import {NextResponse} from 'next/server';
import {createToken} from '@/lib/account';
import {sendMagicLink} from '@/lib/email';
import {isLocale, defaultLocale} from '@/i18n/routing';

/**
 * Issues a sign-in link.
 *
 * Always answers the same way whether or not the address is known, so this
 * endpoint cannot be used to discover which emails have an account.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const rawLocale = String(form.get('locale') ?? '');
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Build links from the host this request actually arrived on, so localhost
  // and preview deployments do not send people to the production domain.
  const origin = new URL(request.url).origin;

  if (looksLikeEmail) {
    const token = createToken(email, 'link');
    const url = `${origin}/api/account/callback?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLink({to: email, url, locale});
    } catch (error) {
      console.error('sign-in link failed to send', error);
    }
  }

  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return NextResponse.redirect(`${origin}${prefix}/account/check-email`, {
    status: 303
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
