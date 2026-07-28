import type {Article} from '@/lib/content';
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
    sameAs: ['https://kratosnatural.com', 'https://kratosnatural.nl']
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

export function articleSchema(article: Article, pathname: string): JsonLdObject {
  const url = absoluteUrl(article.locale, pathname);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    inLanguage: article.locale,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    url,
    image: article.image
      ? absoluteUrl(article.locale, article.image)
      : undefined,
    author: {
      '@type': article.author ? 'Person' : 'Organization',
      name: article.author ?? 'Kratos Natural',
      ...(article.author ? {} : {'@id': ORGANIZATION_ID})
    },
    publisher: {'@id': ORGANIZATION_ID},
    keywords: article.tags?.length ? article.tags.join(', ') : undefined
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
