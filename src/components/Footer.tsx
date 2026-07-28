import {useTranslations} from 'next-intl';
import Container from '@/components/Container';

export default function Footer() {
  const t = useTranslations('Site');

  return (
    <footer className="mt-20 border-t border-kratos-100 py-8 text-sm text-kratos-500">
      <Container>
        <p>
          &copy; {new Date().getFullYear()} {t('name')} &mdash; {t('tagline')}
        </p>
      </Container>
    </footer>
  );
}
