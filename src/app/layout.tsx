import type {ReactNode} from 'react';
import {Covered_By_Your_Grace, IBM_Plex_Mono, Inter} from 'next/font/google';
import {getLocale} from 'next-intl/server';
import {Analytics} from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({subsets: ['latin'], variable: '--font-sans'});

// Display face. Ships a single weight; used only at large sizes.
const coveredByYourGrace = Covered_By_Your_Grace({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display'
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono'
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
      className={`${inter.variable} ${coveredByYourGrace.variable} ${ibmPlexMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        {children}
        {/* Page views and referrers. Cookieless, so no consent banner is owed
            for it, and it does nothing outside a Vercel deployment. */}
        <Analytics />
      </body>
    </html>
  );
}
