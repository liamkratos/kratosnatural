import {NextResponse} from 'next/server';
import {SESSION_COOKIE} from '@/lib/account';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/`, {status: 303});
  response.cookies.set(SESSION_COOKIE, '', {path: '/', maxAge: 0});
  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
