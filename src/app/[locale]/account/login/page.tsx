import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale} from '@/i18n/routing';
import Container from '@/components/Container';

export default async function LoginPage({
  params: {locale},
  searchParams
}: {
  params: {locale: string};
  searchParams: {error?: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  return (
    <Container className="max-w-lg py-24">
      <h1 className="font-display text-5xl font-bold uppercase leading-tight">
        {t('signInTitle')}
      </h1>
      <p className="mt-4 font-display text-xl uppercase text-ink/70">
        {t('signInIntro')}
      </p>

      {searchParams.error === 'expired' && (
        <p
          role="alert"
          className="mt-6 rounded-[20px] border border-ink/20 px-5 py-3 font-display text-lg uppercase"
        >
          {t('expired')}
        </p>
      )}

      <form
        action="/api/account/request"
        method="post"
        className="relative mx-auto mt-10 w-full max-w-md"
      >
        <input type="hidden" name="locale" value={locale} />
        <label htmlFor="account-email" className="sr-only">
          {t('emailLabel')}
        </label>
        <input
          id="account-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('emailLabel')}
          className="w-full rounded-[20px] border border-ink/25 bg-transparent py-3 pl-5 pr-32 text-center font-display text-lg uppercase text-ink placeholder:text-ink/40 focus:border-pink focus:outline-none"
        />
        <button
          type="submit"
          className="absolute inset-y-1 right-1 rounded-[16px] bg-black px-5 font-display text-base uppercase leading-none text-white transition-colors duration-200 hover:text-pink"
        >
          {t('send')}
        </button>
      </form>
    </Container>
  );
}
