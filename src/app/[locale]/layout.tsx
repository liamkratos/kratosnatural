import type {ReactNode} from 'react';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing, isLocale, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import {organizationSchema, websiteSchema} from '@/lib/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import '../globals.css';

const inter = Inter({subsets: ['latin'], variable: '--font-sans'});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string};
}): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: 'Site'});

  return buildMetadata({
    locale,
    title: `${t('name')} — ${t('tagline')}`,
    description: t('description'),
    pathname: '/'
  });
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();

  // Enables static rendering for this locale segment.
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({locale, namespace: 'Site'});

  return (
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <JsonLd
          schema={[
            organizationSchema(locale as Locale),
            websiteSchema(locale as Locale, t('name'))
          ]}
        />
      </body>
    </html>
  );
}
