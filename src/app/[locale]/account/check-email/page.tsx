import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import Container from '@/components/Container';
import Card from '@/components/Card';

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
      <Card>
        <h1 className="quoted font-display text-5xl font-bold uppercase leading-tight">
          {t('checkEmailTitle')}
        </h1>
        <p className="mt-4 font-display text-xl uppercase text-black">
          {t('checkEmailIntro')}
        </p>
      </Card>
    </Container>
  );
}
