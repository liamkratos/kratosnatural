import 'server-only';
import {createHmac, timingSafeEqual, randomUUID} from 'node:crypto';

/**
 * Stateless magic-link sign-in.
 *
 * There is deliberately no user table and no session store. A sign-in link
 * carries a short-lived token that is signed with a server secret; verifying the
 * signature is enough to trust the email inside it. Stripe remains the record of
 * customers and orders, so the only personal data this app holds is an email
 * address inside a signed cookie that expires on its own.
 *
 * The trade-off of going stateless: a link cannot be revoked or forced to
 * single-use without somewhere to record that it was spent. That is mitigated
 * with a deliberately short lifetime (LINK_TTL) — long enough to arrive by
 * email, short enough that a leaked link is not a standing key.
 */

const LINK_TTL_SECONDS = 10 * 60; // 10 minutes
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type TokenPurpose = 'link' | 'session';

type TokenPayload = {
  /** Subject: the customer's email address. */
  email: string;
  /** Purpose, so a sign-in link can never be replayed as a session cookie. */
  purpose: TokenPurpose;
  /** Expiry, seconds since epoch. */
  exp: number;
  /** Nonce, so two tokens issued in the same second differ. */
  jti: string;
};

function secret(): string {
  const value = process.env.ACCOUNT_TOKEN_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      'ACCOUNT_TOKEN_SECRET is missing or too short. Set a random value of at least 32 characters.'
    );
  }
  return value;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(body: string): string {
  return base64url(createHmac('sha256', secret()).update(body).digest());
}

export function createToken(email: string, purpose: TokenPurpose): string {
  const ttl = purpose === 'link' ? LINK_TTL_SECONDS : SESSION_TTL_SECONDS;
  const payload: TokenPayload = {
    email: email.trim().toLowerCase(),
    purpose,
    exp: Math.floor(Date.now() / 1000) + ttl,
    jti: randomUUID()
  };

  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/**
 * Returns the email if the token is valid for `purpose`, otherwise null.
 * Never throws on malformed input — callers treat null as "not signed in".
 */
export function readToken(
  token: string | undefined,
  purpose: TokenPurpose
): string | null {
  if (!token) return null;

  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  // Compare in constant time so a wrong signature cannot be narrowed by timing.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(fromBase64url(body).toString('utf8'));
  } catch {
    return null;
  }

  if (payload.purpose !== purpose) return null;
  if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) {
    return null;
  }
  if (!payload.email) return null;

  return payload.email;
}

export const SESSION_COOKIE = 'kn_session';
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
export const LINK_MAX_AGE = LINK_TTL_SECONDS;
