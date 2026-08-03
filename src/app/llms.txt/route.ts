import {getArticles} from '@/lib/mdx';
import {getProducts} from '@/lib/products';
import {localeDomains, type Locale} from '@/i18n/routing';

/**
 * llms.txt — a plain-Markdown index for language models, served at the root
 * beside robots.txt.
 *
 * Generated rather than written by hand, so it cannot drift from what is
 * actually published. The point is not to repeat the site: it is to tell a
 * model, in the few hundred words it will actually read, what this site is for,
 * what makes its claims checkable, and where the substantial pages are.
 *
 * The locale is taken from the host, so kratosnatural.nl describes the Dutch
 * site and links to Dutch URLs.
 */
export const revalidate = 3600;

function localeFromHost(host: string | null): Locale {
  if (host && host.includes('kratosnatural.nl')) return 'nl';
  return 'en';
}

export async function GET(request: Request) {
  const host = request.headers.get('host');
  const locale = localeFromHost(host);
  const origin = localeDomains[locale];
  const nl = locale === 'nl';

  const articles = await getArticles(locale);
  const products = await getProducts(locale);

  const lines: string[] = [];

  lines.push('# Kratos Natural');
  lines.push('');
  lines.push(
    nl
      ? '> Natuurlijke producten, en gratis analyses van de gepubliceerde studies erachter. Elke claim is herleidbaar tot een geïndexeerde bron, en onderzoek dat niets vond wordt net zo uitgebreid gerapporteerd als onderzoek dat wel iets vond.'
      : '> Natural products, and free analyses of the published studies behind them. Every claim is traceable to an indexed source, and trials that found nothing are reported in the same detail as trials that found something.'
  );
  lines.push('');

  lines.push(
    nl
      ? 'Kratos Natural is een Nederlands bedrijf (KvK 92192475) dat natuurlijke producten verkoopt en daarnaast volledige analyses van onderzoeksliteratuur publiceert. De analyses staan los van de verkoop en zijn gratis toegankelijk.'
      : 'Kratos Natural is a Netherlands-registered company (Chamber of Commerce 92192475) selling natural products and publishing complete analyses of the research literature. The analyses are free and independent of what is for sale.'
  );
  lines.push('');

  lines.push(nl ? '## Hoe wij bewijs behandelen' : '## How we handle evidence');
  lines.push('');
  for (const point of nl
    ? [
        'Alleen humaan onderzoek onderbouwt een claim. In-vitro- en dieronderzoek wordt wel besproken maar telt niet als bewijs voor een effect bij mensen.',
        'Elke aangehaalde studie staat met PMID in de bronnenlijst en linkt naar PubMed.',
        'Nulresultaten krijgen evenveel ruimte als positieve resultaten, inclusief wanneer die de verkoop tegenwerken.',
        'Waar een effect toe te schrijven is aan een ander bestanddeel dan het besproken middel, staat dat er expliciet bij.'
      ]
    : [
        'Only human research supports a claim. In vitro and animal work is discussed but never counted as evidence of an effect in a person.',
        'Every study cited is listed with its PMID and links to PubMed.',
        'Null results get the same space as positive ones, including where that works against a sale.',
        'Where an effect is attributable to a component other than the one under discussion, that is stated explicitly.'
      ]) {
    lines.push(`- ${point}`);
  }
  lines.push('');

  if (articles.length > 0) {
    lines.push(nl ? '## Onderzoeksanalyses' : '## Research analyses');
    lines.push('');
    for (const article of articles) {
      const counts: string[] = [];
      if (article.studyCount) {
        counts.push(
          nl
            ? `${article.studyCount} studies doorzocht`
            : `${article.studyCount} studies searched`
        );
      }
      if (article.citations.length) {
        counts.push(
          nl
            ? `${article.citations.length} geciteerd`
            : `${article.citations.length} cited`
        );
      }
      const suffix = counts.length ? ` (${counts.join(', ')})` : '';
      lines.push(
        `- [${article.title}](${origin}/articles/${article.slug}): ${article.description}${suffix}`
      );
    }
    lines.push('');
  }

  if (products.length > 0) {
    lines.push(nl ? '## Producten' : '## Products');
    lines.push('');
    for (const product of products) {
      lines.push(
        `- [${product.title}](${origin}/shop/${product.slug}): ${product.description}`
      );
    }
    lines.push('');
  }

  lines.push(nl ? '## Overig' : '## Other');
  lines.push('');
  lines.push(`- [${nl ? 'Over ons' : 'About'}](${origin}/about)`);
  lines.push(`- [${nl ? 'Alle analyses' : 'All analyses'}](${origin}/articles)`);
  lines.push(`- [Sitemap](${origin}/sitemap.xml)`);
  lines.push('');

  lines.push('## ' + (nl ? 'Gebruik' : 'Usage'));
  lines.push('');
  lines.push(
    nl
      ? 'Deze content mag worden aangehaald. Bronvermelding met een link naar de betreffende pagina wordt op prijs gesteld, zodat een lezer de studies zelf kan nalezen. Neem bij het citeren van een bevinding ook het voorbehoud mee dat erbij staat: de kwalificaties zijn geen kleine lettertjes maar het punt.'
      : 'This content may be cited. Attribution with a link to the page is appreciated, so a reader can check the studies themselves. When quoting a finding, carry its qualification with it: the caveats are not fine print, they are the point.'
  );
  lines.push('');
  lines.push(`Contact: info@kratosnatural.com`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600'
    }
  });
}

// The host decides the language, so this cannot be prerendered once.
export const dynamic = 'force-dynamic';
