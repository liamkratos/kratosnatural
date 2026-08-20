import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type {Locale} from '@/i18n/routing';
import {locales} from '@/i18n/routing';
import {parseMarkets, type MarketId} from '@/lib/markets';

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
/**
 * A claim made for a product on the strength of published research.
 *
 * `article` is the slug of our own analysis of that literature, and it is
 * required. A shop claim that cannot be traced to a page showing the studies —
 * including the ones that found nothing — is a marketing sentence, and this
 * type exists to make writing one impossible rather than merely discouraged.
 */
export type ProductClaim = {
  text: string;
  article: string;
};

export type ProductResearch = {
  /** Article slugs to link, in the product's own locale. */
  articles?: string[];
  claims?: ProductClaim[];
};

/**
 * Shop categories.
 *
 * A closed list rather than free-form strings, for the same reason the guide
 * domains are: a typo in frontmatter would otherwise create a near-empty
 * category on the shop page that nobody notices. Order here is the order they
 * appear.
 *
 * Labels live in the message files, because a category name is read by a
 * customer and has to be in their language.
 */
export const categories = ['home', 'light', 'supplements'] as const;

export type CategoryId = (typeof categories)[number];

export function isCategoryId(value: string): value is CategoryId {
  return (categories as readonly string[]).includes(value);
}

export type ProductFrontmatter = {
  title: string;
  description: string;
  /** Stripe price id, e.g. "price_1Abc...". Source of truth for the amount. */
  priceId: string;
  /**
   * Markets this product has been **cleared** for sale in. Required, with no
   * default: whether something may be sold in a country is a legal question,
   * and a default would be a guess at one. See `markets.ts` for how this meets
   * the rollout to decide what is actually on sale today.
   */
  markets: MarketId[];
  /**
   * Which shelf this sits on. Optional: a shop with one product does not need
   * categories, and an uncategorised product is still listed rather than
   * silently dropped.
   */
  category?: CategoryId;
  image?: string;
  /**
   * Meta description for search results. The on-page `description` is a
   * one-line label beside the title; a result page needs the fuller sentence,
   * and writing one line to serve both makes it wrong in one of the two places.
   */
  metaDescription?: string;
  /**
   * Additional photographs, shown as a gallery on the product page. `image`
   * stays the primary shot and the one used on cards, so a product with a
   * single photo needs no change.
   */
  images?: string[];
  /** Short spec lines shown on the product page. */
  specs?: string[];
  badge?: string;
  /** Surfaced in the bestsellers block on the homepage. */
  bestseller?: boolean;
  /** Evidence block. Omitted entirely when we have no analysis to point at. */
  research?: ProductResearch;
  draft?: boolean;
};

export type Product = ProductFrontmatter & {
  slug: string;
  locale: Locale;
  body: string;
  specs: string[];
  images: string[];
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
      throw new Error(
        `Product "${ref}" is missing required frontmatter "${field}".`
      );
    }
  }
  if (fm.category && !isCategoryId(fm.category)) {
    throw new Error(
      `Product "${ref}": unknown category "${fm.category}". Valid ids: ${categories.join(', ')}.`
    );
  }
  if (!/^price_/.test(fm.priceId!)) {
    throw new Error(
      `Product "${ref}": "priceId" must be a Stripe price id starting with "price_", got "${fm.priceId}".`
    );
  }

  // Fails the build rather than shipping an unsourced claim.
  for (const [index, claim] of (fm.research?.claims ?? []).entries()) {
    if (!claim?.text || !claim?.article) {
      throw new Error(
        `Product "${ref}": research claim ${index + 1} needs both "text" and "article". ` +
          `Every claim must point at the analysis that supports it.`
      );
    }
  }

  return {
    title: fm.title!,
    description: fm.description!,
    priceId: fm.priceId!,
    markets: parseMarkets(fm.markets, `Product "${ref}"`),
    category: fm.category,
    image: fm.image,
    metaDescription: fm.metaDescription,
    images: fm.images ?? [],
    badge: fm.badge,
    bestseller: fm.bestseller ?? false,
    research: fm.research,
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
  const loaded = await Promise.all(
    slugs.map((slug) => getProduct(locale, slug))
  );

  return loaded
    .filter((product): product is Product => product !== null)
    .filter(
      (product) => !product.draft || process.env.NODE_ENV !== 'production'
    )
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

/**
 * Products grouped by category, in the order declared above.
 *
 * Categories with nothing in them are omitted rather than rendered empty, and
 * anything without a category comes back separately so a product can never
 * disappear from the shop by forgetting one field.
 */
export async function getProductsByCategory(locale: Locale): Promise<{
  grouped: Array<{id: CategoryId; products: Product[]}>;
  uncategorised: Product[];
}> {
  const products = await getProducts(locale);

  return {
    grouped: categories
      .map((id) => ({
        id,
        products: products.filter((product) => product.category === id)
      }))
      .filter((group) => group.products.length > 0),
    uncategorised: products.filter((product) => !product.category)
  };
}
