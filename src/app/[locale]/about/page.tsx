import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
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
  const tSeo = await getTranslations({locale, namespace: 'Seo'});

  return buildMetadata({
    locale,
    title: tSeo('aboutTitle'),
    description: tSeo('aboutDescription'),
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
      <a key="phone" href={COMPANY.phoneHref} className="hover:text-olive">
        {COMPANY.phone}
      </a>
    ],
    [
      t('email'),
      <a
        key="email"
        href={`mailto:${COMPANY.email}`}
        className="hover:text-olive"
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

          <p className="mx-auto mt-6 max-w-2xl text-xl leading-snug sm:text-2xl">
            {t('lead')}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
            {t('body1')}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-snug text-black">
            {t('body2')}
          </p>
        </section>
      </Reveal>

      {/* The manifest sits under the mission rather than beside it in the nav,
          so the mission page has to actually lead somewhere. Without this the
          hierarchy would exist only in the menu. */}
      <Reveal delay={60}>
        <section className="floating mt-6 bg-white p-6 sm:p-10">
          <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
            {t('planTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
            {t('planBody')}
          </p>
          <Link
            href="/plan"
            className="mt-6 inline-block rounded-[20px] bg-olive px-7 py-4 font-display text-lg uppercase leading-none text-white transition-colors duration-200 hover:bg-oliveSoft"
          >
            {t('planCta')}
          </Link>
        </section>
      </Reveal>

      <Reveal delay={120}>
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
                <dd className="text-lg leading-snug sm:border-b sm:border-ink/10 sm:pb-3">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      <Reveal delay={180}>
        <WhereNext className="mt-6" />
      </Reveal>
    </Container>
  );
}
