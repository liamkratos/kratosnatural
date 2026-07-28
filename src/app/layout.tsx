import type {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import {getLocale} from 'next-intl/server';
import './globals.css';

const inter = Inter({subsets: ['latin'], variable: '--font-sans'});

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
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">{children}</body>
    </html>
  );
}
