import {NextResponse} from 'next/server';
import {
  createToken,
  readToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE
} from '@/lib/account';

/**
 * Exchanges a valid sign-in link for a session cookie.
 * The link token and the session token are signed with different purposes, so
 * a link can never be replayed as a session.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const token = requestUrl.searchParams.get('token') ?? undefined;
  const email = readToken(token, 'link');

  if (!email) {
    return NextResponse.redirect(`${origin}/account/login?error=expired`, {
      status: 303
    });
  }

  const response = NextResponse.redirect(`${origin}/account`, {status: 303});

  response.cookies.set(SESSION_COOKIE, createToken(email, 'session'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });

  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
