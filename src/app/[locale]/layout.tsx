import type {ReactNode} from 'react';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing, isLocale, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import {organizationSchema, websiteSchema} from '@/lib/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import JsonLd from '@/components/JsonLd';

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

  const base = buildMetadata({
    locale,
    title: `${t('name')} — ${t('tagline')}`,
    description: t('description'),
    pathname: '/'
  });

  return {
    ...base,
    // Page titles are written to stand alone in a search result; the brand is
    // appended once here rather than repeated in every buildMetadata call. A
    // page that sets an absolute title opts out of the template.
    title: {
      default: `${t('name')} — ${t('tagline')}`,
      template: `%s | ${t('name')}`
    }
  };
}

/**
 * Locale layout. The document shell lives in the root layout (`app/layout.tsx`),
 * so this renders only the i18n provider and the page chrome.
 */
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
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale as Locale} />
      <main className="flex-1">{children}</main>
      <Newsletter />
      <Footer />
      <JsonLd
        schema={[
          organizationSchema(locale as Locale),
          websiteSchema(locale as Locale, t('name'))
        ]}
      />
    </NextIntlClientProvider>
  );
}
