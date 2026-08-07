import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {readToken, SESSION_COOKIE} from '@/lib/account';
import {findGuide, readGuideFile} from '@/lib/guides';
import {ownsGuide} from '@/lib/entitlements';

/**
 * Hands over a purchased guide.
 *
 * The gate is ownership, checked against Stripe on every request rather than
 * trusted from a link. That is the whole reason the download lives behind the
 * account: a signed-in buyer can come back for the file in a year, on a new
 * laptop, and a forwarded email gets whoever receives it nothing.
 *
 * The file is streamed from `private/guides/`, which is not served over HTTP —
 * this handler is the only way to reach it.
 */
export async function GET(
  _request: Request,
  {params}: {params: {slug: string}}
) {
  const email = readToken(cookies().get(SESSION_COOKIE)?.value, 'session');
  if (!email) {
    return NextResponse.json({error: 'Not signed in.'}, {status: 401});
  }

  const guide = await findGuide(params.slug);
  if (!guide) {
    return NextResponse.json({error: 'No such guide.'}, {status: 404});
  }

  if (!(await ownsGuide(email, guide.slug))) {
    // Deliberately 404 rather than 403: a "forbidden" would confirm to anyone
    // probing that this guide exists and is simply not theirs.
    return NextResponse.json({error: 'No such guide.'}, {status: 404});
  }

  const file = await readGuideFile(guide);
  // Copied into a plain Uint8Array: a Node Buffer is not a valid web BodyInit,
  // and the response here is a web Response.
  const body = new Uint8Array(file);

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(body.byteLength),
      'Content-Disposition': `attachment; filename="${guide.file}"`,
      // Never cached by a proxy: the response is personal, and a shared cache
      // could otherwise serve it to the next person asking for the same URL.
      'Cache-Control': 'private, no-store'
    }
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
