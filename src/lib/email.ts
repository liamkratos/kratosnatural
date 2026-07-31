import 'server-only';

/**
 * Outbound email.
 *
 * Provider-agnostic on purpose: the only thing the rest of the app needs is
 * "send this sign-in link". Configure RESEND_API_KEY to send for real; without
 * it, development logs the link to the server console so sign-in can be tested
 * locally, and production refuses rather than silently dropping the mail.
 */
type MagicLinkEmail = {
  to: string;
  url: string;
  locale: string;
};

export async function sendMagicLink({to, url, locale}: MagicLinkEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ACCOUNT_EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'RESEND_API_KEY and ACCOUNT_EMAIL_FROM must be set to send sign-in links.'
      );
    }
    // eslint-disable-next-line no-console
    console.warn(`\n[dev] sign-in link for ${to}:\n${url}\n`);
    return;
  }

  const subject =
    locale === 'nl' ? 'Je inloglink voor Kratos Natural' : 'Your Kratos Natural sign-in link';
  const body =
    locale === 'nl'
      ? `Klik om in te loggen. Deze link verloopt over 10 minuten.\n\n${url}`
      : `Click to sign in. This link expires in 10 minutes.\n\n${url}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({from, to, subject, text: body})
  });

  if (!response.ok) {
    throw new Error(`Sending the sign-in link failed (${response.status}).`);
  }
}

/** Where the free guide lives, relative to the site origin. */
export const EBOOK_PATH = '/downloads/aging-cant-be-stopped.pdf';

/**
 * Newsletter welcome, carrying the link to the free guide.
 *
 * The guide is linked rather than attached. An attachment on a first contact
 * from an unfamiliar sender is what spam filters weigh most heavily, and a
 * link also means the file can be corrected later without re-sending.
 */
export async function sendEbook({
  to,
  origin,
  locale
}: {
  to: string;
  origin: string;
  locale: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ACCOUNT_EMAIL_FROM;
  const url = `${origin}${EBOOK_PATH}`;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'RESEND_API_KEY and ACCOUNT_EMAIL_FROM must be set to send the guide.'
      );
    }
    // eslint-disable-next-line no-console
    console.warn(`\n[dev] ebook link for ${to}:\n${url}\n`);
    return;
  }

  const nl = locale === 'nl';
  const subject = nl
    ? 'Je gratis gids: Aging Can\u2019t Be Stopped'
    : 'Your free guide: Aging Can\u2019t Be Stopped';

  const text = nl
    ? [
        'Welkom bij Kratos Weekly.',
        '',
        `Hier is je gratis gids: ${url}`,
        '',
        'Elke vrijdag sturen we de analyse van het onderzoek van die week, plus een recept, een workout en een song met uitleg.',
        '',
        'Kratos Natural'
      ].join('\n')
    : [
        'Welcome to Kratos Weekly.',
        '',
        `Here is your free guide: ${url}`,
        '',
        'Every Friday we send that week\u2019s research analysis, plus a recipe, a workout and a song with an explanation.',
        '',
        'Kratos Natural'
      ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({from, to, subject, text})
  });

  if (!response.ok) {
    throw new Error(`Sending the guide failed (${response.status}).`);
  }
}
