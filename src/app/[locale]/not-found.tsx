import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import Container from '@/components/Container';

export default function NotFoundPage() {
  const t = useTranslations('NotFound');

  return (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        {t('title')}
      </h1>
      <p className="mt-4 text-black">{t('description')}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-black underline underline-offset-4"
      >
        {t('back')}
      </Link>
    </Container>
  );
}
