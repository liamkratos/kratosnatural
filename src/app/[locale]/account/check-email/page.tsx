import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import Container from '@/components/Container';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';

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
      <PageHeader title={t('checkEmailTitle')} />

      <Card>
        <p className="mt-4 text-xl text-black">{t('checkEmailIntro')}</p>
      </Card>
    </Container>
  );
}
