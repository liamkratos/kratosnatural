import type {ReactNode} from 'react';
import {Covered_By_Your_Grace, Poppins} from 'next/font/google';
import {getLocale} from 'next-intl/server';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import './globals.css';

/*
 * Body face. The display face is a handwriting script: legible as a wordmark or
 * a heading, hard to read as running text, and hardest of all for a dyslexic
 * reader, whose eye leans on the outline of a word that a connected script does
 * not give. Paragraphs are set in Poppins; headings keep the script.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body'
});

// Display face. Ships a single weight; used only at large sizes.
const coveredByYourGrace = Covered_By_Your_Grace({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display'
});

/**
 * Root layout — the only place that renders <html>/<body>.
 *
 * Next requires a root layout above `app/not-found.tsx`, and it must render the
 * document shell: with a pass-through root layout, a nested notFound() cannot be
 * server-rendered and Next falls back to its bare `__next_error__` shell.
 *
 * The locale is read via getLocale() rather than a route param, because this
 * layout sits above the `[locale]` segment and also wraps the global 404.
 */
export default async function RootLayout({children}: {children: ReactNode}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${coveredByYourGrace.variable} ${poppins.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        {children}
        {/* Page views, referrers and real-user load times. Both are
            cookieless, so no consent banner is owed for them, and both are
            inert outside a Vercel deployment. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
