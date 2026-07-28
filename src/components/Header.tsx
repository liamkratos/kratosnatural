import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import Container from '@/components/Container';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Header({locale}: {locale: Locale}) {
  const t = useTranslations();

  return (
    <header className="border-b border-kratos-100">
      <Container className="flex items-center justify-between gap-6 py-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-kratos-900"
        >
          {t('Site.name')}
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-kratos-700 hover:text-kratos-900">
            {t('Nav.home')}
          </Link>
          <Link
            href="/articles"
            className="text-kratos-700 hover:text-kratos-900"
          >
            {t('Nav.articles')}
          </Link>
          <LocaleSwitcher current={locale} />
        </nav>
      </Container>
    </header>
  );
}
