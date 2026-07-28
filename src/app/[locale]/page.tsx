import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import Container from '@/components/Container';

export default async function HomePage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Home');

  return (
    <Container className="py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-kratos-900">
        {t('title')}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-kratos-700">{t('intro')}</p>
      <Link
        href="/articles"
        className="mt-8 inline-block rounded-md bg-kratos-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-kratos-900"
      >
        {t('cta')}
      </Link>
    </Container>
  );
}
