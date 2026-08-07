import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {
  getFormatter,
  getTranslations,
  setRequestLocale
} from 'next-intl/server';
import {isLocale, locales} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getPlan, type InlineNode, type Paragraph} from '@/lib/plan';
import {buildMetadata} from '@/lib/seo';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import WhereNext from '@/components/WhereNext';

type PageParams = {params: {locale: string}};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params: {locale}
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) notFound();
  const tSeo = await getTranslations({locale, namespace: 'Seo'});

  return buildMetadata({
    locale,
    title: tSeo('planTitle'),
    description: tSeo('planDescription'),
    pathname: '/plan',
    type: 'article'
  });
}

/**
 * Render one inline run.
 *
 * Internal links go through the locale-aware Link so they respect the domain
 * routing; external ones open in a new tab. Bold is the emphasis the copy is
 * written around — one phrase per paragraph — so it is set in olive, which is
 * the accent that survives on a white surface.
 */
function Inline({node}: {node: InlineNode}) {
  switch (node.type) {
    case 'strong':
      return <strong className="font-semibold text-olive">{node.value}</strong>;
    case 'em':
      return <em className="italic">{node.value}</em>;
    case 'link':
      return node.href.startsWith('/') ? (
        <Link href={node.href} className="text-olive underline">
          {node.value}
        </Link>
      ) : (
        <a
          href={node.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-olive underline"
        >
          {node.value}
        </a>
      );
    default:
      return <>{node.value}</>;
  }
}

function Prose({paragraph}: {paragraph: Paragraph}) {
  return (
    <>
      {paragraph.map((node, index) => (
        <Inline key={index} node={node} />
      ))}
    </>
  );
}

export default async function PlanPage({params: {locale}}: PageParams) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const plan = await getPlan(locale);
  if (!plan) notFound();

  const t = await getTranslations('Plan');
  const format = await getFormatter({locale});

  // The opening section carries the document's thesis, so it is set larger and
  // sits in the same card as the title. The rest follow as their own blocks.
  const [lead, ...rest] = plan.sections;

  return (
    <Container className="max-w-4xl py-16">
      <Reveal>
        <Card>
          <h1
            className="quoted font-display font-bold uppercase leading-tight"
            style={{fontSize: 'clamp(2rem, 6vw, 4rem)'}}
          >
            {plan.heading}
          </h1>

          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-black">
            {t('byline', {
              author: plan.author,
              date: format.dateTime(new Date(plan.date), {
                year: 'numeric',
                month: 'long'
              })
            })}
          </p>

          {lead && (
            <div id={lead.id} className="mx-auto mt-8 max-w-2xl scroll-mt-28">
              {lead.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-4 text-lg leading-snug first:mt-0 sm:text-xl"
                >
                  <Prose paragraph={paragraph} />
                </p>
              ))}
            </div>
          )}
        </Card>
      </Reveal>

      {/* The sections in document order. Each is its own card so the manifest
          reads as a sequence of arguments rather than one wall of copy, and
          each keeps an anchor so a single section can be linked to directly. */}
      {rest.map((section, index) => (
        <Reveal key={section.id} delay={Math.min((index + 1) * 60, 240)}>
          <Card id={section.id} className="mt-6 scroll-mt-28">
            <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
              {section.heading}
            </h2>

            <div className="mx-auto mt-8 max-w-2xl">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className="mt-4 text-lg leading-snug first:mt-0"
                >
                  <Prose paragraph={paragraph} />
                </p>
              ))}
            </div>

            {/* The closing signature belongs to the last section, and is set as
                a signature rather than as one more line of body copy. */}
            {plan.signature && index === rest.length - 1 && (
              <p className="mt-10 font-display text-2xl uppercase leading-none text-olive">
                {plan.signature}
              </p>
            )}
          </Card>
        </Reveal>
      ))}

      <Reveal delay={300}>
        <WhereNext className="mt-6" />
      </Reveal>
    </Container>
  );
}
