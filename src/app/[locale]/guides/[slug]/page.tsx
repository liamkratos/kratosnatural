import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getGuide, getAllGuideParams, domainLabel} from '@/lib/guides';
import {getPrice} from '@/lib/pricing';
import {buildMetadata} from '@/lib/seo';
import {formatPrice} from '@/lib/utils';
import Container from '@/components/Container';
import Card from '@/components/Card';
import MedicalNotice from '@/components/MedicalNotice';
import Reveal from '@/components/Reveal';

export const revalidate = 300;

type PageParams = {params: {locale: string; slug: string}};

export async function generateStaticParams() {
  return getAllGuideParams();
}

export async function generateMetadata({
  params: {locale, slug}
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const guide = await getGuide(locale, slug);
  if (!guide) return {};

  return buildMetadata({
    locale,
    title: guide.title,
    description: guide.summary,
    pathname: `/guides/${guide.slug}`,
    image: guide.cover
  });
}

export default async function GuidePage({params: {locale, slug}}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const guide = await getGuide(locale, slug);
  if (!guide) notFound();

  const t = await getTranslations('Guides');
  const price = await getPrice(guide.priceId);

  return (
    <Container className="max-w-4xl py-16">
      <Reveal>
        <Card>
          <div className="grid gap-8 sm:grid-cols-[minmax(0,260px),1fr] sm:items-start sm:text-left">
            <div className="floating relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden bg-kratos-50">
              <Image
                src={guide.cover}
                alt={guide.title}
                fill
                sizes="260px"
                priority
                className="object-cover"
              />
            </div>

            <div>
              {guide.domain && (
                <p className="font-mono text-xs uppercase tracking-widest text-olive">
                  {domainLabel(guide.domain)}
                  {guide.pillar ? ` · ${t('ebook')}` : ''}
                </p>
              )}

              <h1 className="quoted mt-3 font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
                {guide.title}
              </h1>

              <p className="mt-4 text-lg leading-snug text-black">
                {guide.summary}
              </p>

              <p className="mt-6 font-display text-2xl uppercase leading-none text-olive">
                {price
                  ? formatPrice(price.amountCents, locale)
                  : t('priceUnavailable')}
                {price && (
                  <span className="ml-2 font-mono text-xs tracking-widest text-black">
                    {price.taxInclusive ? t('inclVat') : t('exclVat')}
                  </span>
                )}
              </p>

              {/* A button that cannot charge is worse than no button: without a
                  resolvable price the form is replaced by a plain statement. */}
              {price ? (
                <form
                  action="/api/checkout/guide"
                  method="POST"
                  className="mt-6"
                >
                  <input type="hidden" name="slug" value={guide.slug} />
                  <input type="hidden" name="locale" value={locale} />

                  {/*
                   * Waiver of the 14-day right of withdrawal.
                   *
                   * A download cannot be given back, so EU law lets the right be
                   * waived — but only on two conditions, and both are in the
                   * label: the buyer consents to delivery starting immediately,
                   * and acknowledges that this is what costs them the right.
                   * Consent has to be express, which is why this is an empty box
                   * the buyer ticks rather than a pre-ticked one or a sentence
                   * buried in the terms. `required` means the browser blocks
                   * submission until they do; the server checks again, because
                   * a form can be posted without ever rendering this page.
                   */}
                  <label className="longform mb-5 flex cursor-pointer items-start gap-3 text-left">
                    <input
                      type="checkbox"
                      name="withdrawalWaiver"
                      value="granted"
                      required
                      className="mt-1 h-5 w-5 shrink-0 accent-olive"
                    />
                    <span className="text-sm leading-relaxed text-black">
                      {t('withdrawalWaiver')}
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="rounded-[20px] bg-olive px-7 py-4 font-display text-lg uppercase leading-none text-white transition-colors duration-200 hover:bg-oliveSoft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
                  >
                    {t('buy')}
                  </button>
                </form>
              ) : (
                <p className="mt-6 font-mono text-xs uppercase tracking-widest text-black">
                  {t('unavailable')}
                </p>
              )}

              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-black">
                {t('delivery')}
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {guide.contents && guide.contents.length > 0 && (
        <Reveal delay={60}>
          <Card className="mt-6">
            <h2 className="quoted font-display text-2xl font-bold uppercase leading-tight sm:text-3xl">
              {t('contents')}
            </h2>
            <ul className="longform mx-auto mt-8 max-w-2xl space-y-3">
              {guide.contents.map((item) => (
                <li
                  key={item}
                  className="border-b border-ink/10 pb-3 text-base leading-relaxed text-black"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      )}

      {/* The evidence behind the protocol, free and reachable without buying.
          This link is the argument for the whole library: read the research
          first, and only pay for the applied version if it earns it. */}
      {guide.research && (
        <Reveal delay={120}>
          <Card className="mt-6">
            <h2 className="quoted font-display text-2xl font-bold uppercase leading-tight sm:text-3xl">
              {t('researchTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-snug text-black">
              {t('researchBody')}
            </p>
            <Link
              href={`/articles/${guide.research}`}
              className="mt-6 inline-block rounded-[20px] border-2 border-olive px-6 py-3 font-display text-base uppercase leading-none text-olive transition-colors duration-200 hover:bg-olive hover:text-white"
            >
              {t('researchRead')}
            </Link>
          </Card>
        </Reveal>
      )}

      <Reveal delay={180}>
        <MedicalNotice className="mt-6" />
      </Reveal>
    </Container>
  );
}
