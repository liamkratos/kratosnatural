import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import Container from '@/components/Container';

export default function NotFoundPage() {
  const t = useTranslations('NotFound');

  return (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-kratos-900">
        {t('title')}
      </h1>
      <p className="mt-4 text-kratos-700">{t('description')}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-kratos-700 underline underline-offset-4"
      >
        {t('back')}
      </Link>
    </Container>
  );
}
