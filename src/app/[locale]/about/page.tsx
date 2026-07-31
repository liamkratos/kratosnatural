import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import WhereNext from '@/components/WhereNext';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string};
}): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: 'About'});

  return buildMetadata({
    locale,
    title: t('title'),
    description: t('lead'),
    pathname: '/about'
  });
}

/**
 * Company details, kept in one place so the About page and the legal notice
 * cannot drift apart. These come from the Chamber of Commerce registration.
 */
const COMPANY = {
  tradeName: 'Kratos Natural',
  phone: '+31 6 44516940',
  phoneHref: 'tel:+31644516940',
  email: 'info@kratosnatural.com',
  address: 'Clausstraat 6, 2661 BZ Bergschenhoek, Nederland',
  vat: 'NL004942521B32',
  coc: '92192475'
};

export default async function AboutPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('About');

  const details: Array<[string, React.ReactNode]> = [
    [t('tradeName'), COMPANY.tradeName],
    [
      t('phone'),
      <a key="phone" href={COMPANY.phoneHref} className="hover:text-pink">
        {COMPANY.phone}
      </a>
    ],
    [
      t('email'),
      <a
        key="email"
        href={`mailto:${COMPANY.email}`}
        className="hover:text-pink"
      >
        {COMPANY.email}
      </a>
    ],
    [t('address'), COMPANY.address],
    [t('vat'), COMPANY.vat],
    [t('coc'), COMPANY.coc]
  ];

  return (
    <Container className="max-w-4xl py-16">
      <Reveal>
        <section className="floating bg-white p-6 sm:p-10">
          <h1
            className="quoted whitespace-nowrap font-display font-bold uppercase leading-tight"
            style={{fontSize: 'clamp(2rem, 7vw, 4.5rem)'}}
          >
            {t('title')}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-display text-xl uppercase leading-snug sm:text-2xl">
            {t('lead')}
          </p>
          <p className="mx-auto mt-4 max-w-2xl font-display text-lg uppercase leading-snug text-black">
            {t('body1')}
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-display text-lg uppercase leading-snug text-black">
            {t('body2')}
          </p>
        </section>
      </Reveal>

      <Reveal delay={60}>
        <section className="floating mt-6 bg-white p-6 sm:p-10">
          <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
            {t('detailsTitle')}
          </h2>

          <dl className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-[auto,1fr] sm:gap-x-8">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="border-b border-ink/10 pb-3 sm:contents"
              >
                <dt className="font-mono text-xs uppercase tracking-widest text-black">
                  {label}
                </dt>
                <dd className="font-display text-lg uppercase leading-snug sm:border-b sm:border-ink/10 sm:pb-3">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <WhereNext className="mt-6" />
      </Reveal>
    </Container>
  );
}
