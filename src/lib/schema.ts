import type {Article, Citation} from '@/lib/mdx';
import {citationUrl} from '@/lib/mdx';
import type {Locale} from '@/i18n/routing';
import {absoluteUrl} from '@/lib/seo';

/**
 * Schema.org JSON-LD builders. Render the result with the <JsonLd /> component.
 */

type JsonLdObject = Record<string, unknown>;

const ORGANIZATION_ID = 'https://kratosnatural.com/#organization';

export function organizationSchema(locale: Locale): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Kratos Natural',
    url: absoluteUrl(locale),
    logo: absoluteUrl(locale, '/logo.png'),
    // The profiles that are demonstrably the same entity as this site. Search
    // engines and AI answer engines use it to tie them together, so it lists
    // the locale's own accounts rather than every account we have.
    sameAs: [
      'https://kratosnatural.com',
      'https://kratosnatural.nl',
      locale === 'nl'
        ? 'https://www.instagram.com/kratos_natural/'
        : 'https://www.instagram.com/kratos.natural/',
      locale === 'nl'
        ? 'https://www.youtube.com/channel/UCET_4WGv5oQRkGJ4pTQNcDA'
        : 'https://www.youtube.com/@kratosnatural'
    ]
  };
}

export function websiteSchema(locale: Locale, name: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl(locale)}/#website`,
    name,
    url: absoluteUrl(locale),
    inLanguage: locale,
    publisher: {'@id': ORGANIZATION_ID}
  };
}

/**
 * One citation as a ScholarlyArticle.
 *
 * DOI and PMID are emitted as PropertyValue identifiers rather than being
 * buried in the URL, so a consumer can resolve the source without parsing
 * strings — this is what makes a claim independently checkable.
 */
function citationNode(citation: Citation): JsonLdObject {
  const identifiers: JsonLdObject[] = [];
  if (citation.doi) {
    identifiers.push({
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: citation.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '')
    });
  }
  if (citation.pmid) {
    identifiers.push({
      '@type': 'PropertyValue',
      propertyID: 'PMID',
      value: citation.pmid
    });
  }

  return {
    '@type': 'ScholarlyArticle',
    name: citation.text,
    url: citationUrl(citation) ?? undefined,
    identifier: identifiers.length ? identifiers : undefined
  };
}

export function articleSchema(article: Article, pathname: string): JsonLdObject {
  const url = absoluteUrl(article.locale, pathname);

  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.description,
    abstract: article.description,
    datePublished: article.publishDate,
    dateModified: article.updatedDate ?? article.publishDate,
    inLanguage: article.locale,
    mainEntityOfPage: {'@id': `${url}#webpage`},
    url,
    wordCount: article.body.trim().split(/\s+/).filter(Boolean).length,
    image: article.image
      ? absoluteUrl(article.locale, article.image)
      : undefined,
    author: {'@type': 'Person', name: article.author},
    publisher: {'@id': ORGANIZATION_ID},
    keywords: article.tags?.length ? article.tags.join(', ') : undefined,
    citation: article.citations.length
      ? article.citations.map(citationNode)
      : undefined
  };
}

/**
 * MedicalWebPage for the same URL.
 *
 * `lastReviewed` and the citation count are the signals that distinguish a
 * reviewed, sourced health page from generic content.
 */
export function medicalWebPageSchema(
  article: Article,
  pathname: string
): JsonLdObject {
  const url = absoluteUrl(article.locale, pathname);

  return {
    '@type': 'MedicalWebPage',
    '@id': `${url}#webpage`,
    url,
    name: article.title,
    description: article.description,
    inLanguage: article.locale,
    lastReviewed: article.updatedDate ?? article.publishDate,
    datePublished: article.publishDate,
    dateModified: article.updatedDate ?? article.publishDate,
    isPartOf: {'@id': `${absoluteUrl(article.locale)}/#website`},
    audience: {'@type': 'MedicalAudience', audienceType: 'Patient'},
    // Key findings are the page's primary entity: each is a standalone,
    // quotable conclusion backed by the citations below.
    mainEntity: article.keyFindings.length
      ? {
          '@type': 'ItemList',
          name: 'Key findings',
          numberOfItems: article.keyFindings.length,
          itemListElement: article.keyFindings.map((finding, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: finding
          }))
        }
      : undefined,
    citation: article.citations.length
      ? article.citations.map(citationNode)
      : undefined
  };
}

/**
 * Article + MedicalWebPage as a single @graph, cross-linked by @id.
 * One <script> per page keeps the entity relationships explicit.
 */
export function articlePageSchema(
  article: Article,
  pathname: string
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema(article, pathname),
      medicalWebPageSchema(article, pathname)
    ]
  };
}

export function breadcrumbSchema(
  locale: Locale,
  crumbs: Array<{name: string; pathname: string}>
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(locale, crumb.pathname)
    }))
  };
}

type ProductInput = {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  priceEur: number;
  pathname: string;
  inStock?: boolean;
};

export function productSchema(
  locale: Locale,
  product: ProductInput
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image ? absoluteUrl(locale, product.image) : undefined,
    brand: {'@type': 'Brand', name: 'Kratos Natural'},
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(locale, product.pathname),
      priceCurrency: 'EUR',
      price: product.priceEur.toFixed(2),
      availability:
        product.inStock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock'
    }
  };
}

export function faqSchema(
  items: Array<{question: string; answer: string}>
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {'@type': 'Answer', text: item.answer}
    }))
  };
}
