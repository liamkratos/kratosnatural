import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type {Locale} from '@/i18n/routing';
import {locales} from '@/i18n/routing';

const PRODUCTS_ROOT = path.join(process.cwd(), 'src', 'content', 'products');

/**
 * Products.
 *
 * Split deliberately: Stripe owns the money (price, currency, tax behaviour),
 * the repo owns the words and pictures. A price change in the Stripe dashboard
 * needs no deploy, and marketing copy needs no dashboard.
 *
 * The MDX frontmatter therefore carries no price — only the Stripe price id it
 * resolves against. Prices are fetched at render and cached, so the shop never
 * displays a figure that disagrees with what Checkout will charge.
 */
export type ProductFrontmatter = {
  title: string;
  description: string;
  /** Stripe price id, e.g. "price_1Abc...". Source of truth for the amount. */
  priceId: string;
  image?: string;
  /** Short spec lines shown on the product page. */
  specs?: string[];
  badge?: string;
  /** Surfaced in the bestsellers block on the homepage. */
  bestseller?: boolean;
  draft?: boolean;
};

export type Product = ProductFrontmatter & {
  slug: string;
  locale: Locale;
  body: string;
  specs: string[];
};

function localeDir(locale: Locale) {
  return path.join(PRODUCTS_ROOT, locale);
}

function parseProduct(locale: Locale, slug: string, raw: string): Product {
  const ref = `${locale}/${slug}.mdx`;
  const {data, content} = matter(raw);
  const fm = data as Partial<ProductFrontmatter>;

  for (const field of ['title', 'description', 'priceId'] as const) {
    if (!fm[field]) {
      throw new Error(`Product "${ref}" is missing required frontmatter "${field}".`);
    }
  }
  if (!/^price_/.test(fm.priceId!)) {
    throw new Error(
      `Product "${ref}": "priceId" must be a Stripe price id starting with "price_", got "${fm.priceId}".`
    );
  }

  return {
    title: fm.title!,
    description: fm.description!,
    priceId: fm.priceId!,
    image: fm.image,
    badge: fm.badge,
    bestseller: fm.bestseller ?? false,
    draft: fm.draft ?? false,
    specs: fm.specs ?? [],
    slug,
    locale,
    body: content
  };
}

export async function getProductSlugs(locale: Locale): Promise<string[]> {
  try {
    const entries = await fs.readdir(localeDir(locale));
    return entries
      .filter((file) => /\.mdx?$/.test(file))
      .map((file) => file.replace(/\.mdx?$/, ''));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function getProduct(
  locale: Locale,
  slug: string
): Promise<Product | null> {
  for (const extension of ['.mdx', '.md']) {
    try {
      const raw = await fs.readFile(
        path.join(localeDir(locale), `${slug}${extension}`),
        'utf8'
      );
      return parseProduct(locale, slug, raw);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return null;
}

export async function getProducts(locale: Locale): Promise<Product[]> {
  const slugs = await getProductSlugs(locale);
  const loaded = await Promise.all(slugs.map((slug) => getProduct(locale, slug)));

  return loaded
    .filter((product): product is Product => product !== null)
    .filter((product) => !product.draft || process.env.NODE_ENV !== 'production')
    .sort((a, b) => a.title.localeCompare(b.title, a.locale));
}

export async function getAllProductParams(): Promise<
  Array<{locale: Locale; slug: string}>
> {
  const perLocale = await Promise.all(
    locales.map(async (locale) => {
      const products = await getProducts(locale);
      return products.map((product) => ({locale, slug: product.slug}));
    })
  );
  return perLocale.flat();
}

/**
 * Products for the homepage bestsellers block.
 *
 * Falls back to the newest products when nothing is flagged, so the block is
 * never empty just because no one has ticked `bestseller` yet.
 */
export async function getBestsellers(
  locale: Locale,
  limit = 4
): Promise<Product[]> {
  const products = await getProducts(locale);
  const flagged = products.filter((product) => product.bestseller);
  return (flagged.length > 0 ? flagged : products).slice(0, limit);
}
