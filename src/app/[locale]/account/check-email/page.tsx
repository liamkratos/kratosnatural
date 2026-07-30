import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import Container from '@/components/Container';

export default async function CheckEmailPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  return (
    <Container className="max-w-lg py-24">
      <h1 className="font-display text-5xl font-bold uppercase leading-tight">
        {t('checkEmailTitle')}
      </h1>
      <p className="mt-4 font-display text-xl uppercase text-black">
        {t('checkEmailIntro')}
      </p>
    </Container>
  );
}
