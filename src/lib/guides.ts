import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type {Locale} from '@/i18n/routing';
import {parseMarkets, isSellable, type MarketId} from '@/lib/markets';

/**
 * Written guides and e-books, sold as files.
 *
 * The counterpart to the free research. An analysis on this site is the
 * evidence and stays free forever; a guide is the applied protocol built on top
 * of it, and that is the part that is paid for. The rule that keeps the two
 * honest: nothing that is evidence ever moves behind the paywall.
 *
 * Nothing here ships, so there is no stock, no weight and no delivery address
 * beyond the one Stripe needs to work out VAT. What replaces all of that is a
 * single question: does this person own this file? See `entitlements.ts` for
 * the answer and `api/download/[slug]` for the gate.
 *
 * The PDF lives in `private/guides/`, never in `public/`. A file under `public/`
 * is served by URL to anyone who knows or guesses the name, which would make the
 * paywall decorative.
 *
 * Deliberately a separate module from `products.ts`: a lamp has stock, weight
 * and a shipping address, a PDF has none of those, and folding both into one
 * type means every consumer carries fields that are meaningless half the time.
 */

const GUIDES_ROOT = path.join(process.cwd(), 'src', 'content', 'guides');
const FILES_ROOT = path.join(process.cwd(), 'private', 'guides');

/**
 * The five things a life is made of, as the library divides them.
 *
 * The top level a reader chooses from. Domains sit underneath: somebody
 * arrives knowing they want to sleep better long before they know whether
 * that is a Body problem or an Environment one, so the category is the shelf
 * and the domain is the section on it.
 *
 * Labels are not here. A category name is read by a customer and has to be in
 * their language, so it lives in the message files under `Guides.cat_*`.
 */
export const guideCategories = [
  'mind',
  'soul',
  'body',
  'nutrition',
  'environment'
] as const;

export type GuideCategoryId = (typeof guideCategories)[number];

/**
 * The domain a guide belongs to, and the category that domain sits under.
 *
 * A closed list rather than free-form strings: a typo in frontmatter would
 * otherwise silently create a near-empty domain on the shop page. Order here is
 * the order they appear within a category.
 *
 * A guide declares only its domain. The category is derived, so a guide can
 * never disagree with its own domain about where it belongs, and moving a
 * domain between categories is one edit here rather than one per guide.
 */
export const domains = [
  // MIND — how you think, focus and regulate.
  {id: 'stress', category: 'mind'},
  {id: 'brein', category: 'mind'},
  {id: 'slaap', category: 'mind'},

  // SOUL — meaning, connection, and the practices around them.
  {id: 'zingeving', category: 'soul'},

  // BODY — the machine itself.
  {id: 'houding', category: 'body'},
  {id: 'kracht', category: 'body'},
  {id: 'metabool', category: 'body'},
  {id: 'testen', category: 'body'},

  // NUTRITION — what goes in.
  {id: 'voeding', category: 'nutrition'},
  {id: 'supplementen', category: 'nutrition'},
  {id: 'darmen', category: 'nutrition'},

  // ENVIRONMENT — what the world does to you while you are not looking.
  {id: 'licht', category: 'environment'},
  {id: 'omgeving', category: 'environment'}
] as const satisfies ReadonlyArray<{id: string; category: GuideCategoryId}>;

export type DomainId = (typeof domains)[number]['id'];

export function isDomainId(value: string): value is DomainId {
  return domains.some((domain) => domain.id === value);
}

/** Which of the five a domain belongs to. */
export function categoryOf(id: DomainId): GuideCategoryId {
  return domains.find((domain) => domain.id === id)!.category;
}

export type GuideFrontmatter = {
  title: string;
  /** One or two sentences, used on the card and as the meta description. */
  summary: string;
  /**
   * The Stripe price, e.g. "price_1Abc…". Not the product id: a product can
   * carry several prices, and checkout has to be told which one it is selling.
   */
  priceId: string;
  /** Cover image under `public/`, e.g. "/guides/houding-schouders.jpg". */
  cover: string;
  /** Filename inside `private/guides/`, e.g. "houding-schouders-nl.pdf". */
  file: string;
  /**
   * Markets this guide has been cleared for. Required, exactly as it is on a
   * product — a guide carries claims too, and VAT on a download follows the
   * buyer's country.
   *
   * Worth knowing what this can and cannot do: Stripe restricts *shipping*
   * countries and has no billing equivalent, so unlike a parcel this cannot be
   * enforced at the payment. It hides the guide and refuses the sale in our own
   * app, which is the real control available for something that is delivered
   * over the wire.
   */
  markets: MarketId[];
  /** Which domain this belongs to on the shop page. */
  domain?: DomainId;
  /**
   * True for the domain's pillar e-book, false for a single-problem guide.
   * The e-book is listed first in its domain and priced as the upgrade.
   */
  pillar?: boolean;
  /** Page count, shown so a buyer knows what arrives. */
  pages?: number;
  /** What the reader gets, as bullet points. */
  contents?: string[];
  /**
   * Slug of the free analysis backing this guide, e.g. "infrarood-licht".
   * Rendered as a link so the evidence is reachable without paying.
   */
  research?: string;
  /** Lower sorts first within a domain. */
  order?: number;
  /** Hidden from production, visible in development. */
  draft?: boolean;
};

export type Guide = GuideFrontmatter & {
  slug: string;
  locale: Locale;
};

async function readDir(locale: Locale): Promise<string[]> {
  try {
    const entries = await fs.readdir(path.join(GUIDES_ROOT, locale));
    return entries.filter((name) => name.endsWith('.mdx'));
  } catch {
    // No guides written in this language yet. An empty shop is a valid state.
    return [];
  }
}

function parse(raw: string, slug: string, locale: Locale): Guide {
  const {data} = matter(raw);
  const front = data as Partial<GuideFrontmatter>;

  // Frontmatter is hand-written, and every one of these fields is load-bearing:
  // a guide without a price cannot be bought and one without a file cannot be
  // delivered. Failing at build time beats discovering it at checkout.
  for (const key of ['title', 'summary', 'priceId', 'cover', 'file'] as const) {
    if (!front[key]) {
      throw new Error(
        `Guide ${locale}/${slug} is missing "${key}" in its frontmatter.`
      );
    }
  }

  if (front.domain && !isDomainId(front.domain)) {
    throw new Error(
      `Guide ${locale}/${slug}: unknown domain "${front.domain}". Valid ids: ${domains
        .map((domain) => domain.id)
        .join(', ')}.`
    );
  }

  return {
    ...(front as GuideFrontmatter),
    markets: parseMarkets(front.markets, `Guide ${locale}/${slug}`),
    slug,
    locale
  };
}

/**
 * Whether a guide belongs in a listing.
 *
 * Drafts are visible in development and excluded from production builds. A
 * guide cleared for no market that is currently open is excluded everywhere:
 * listing something that cannot be sold is worse than not listing it.
 *
 * Deliberately not applied by `getGuide` or `findGuide`. Those back the
 * entitlement check and the download, and somebody who already bought a guide
 * keeps it — closing a market must not confiscate a file that has been paid
 * for.
 */
function isVisible(guide: Guide) {
  const published = !guide.draft || process.env.NODE_ENV !== 'production';
  return published && isSellable(guide.markets);
}

/** Every guide on sale in this language, in display order. */
export async function getGuides(locale: Locale): Promise<Guide[]> {
  const files = await readDir(locale);

  const guides = await Promise.all(
    files.map(async (name) => {
      const raw = await fs.readFile(
        path.join(GUIDES_ROOT, locale, name),
        'utf8'
      );
      return parse(raw, name.replace(/\.mdx$/, ''), locale);
    })
  );

  return guides
    .filter(isVisible)
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title)
    );
}

/**
 * Guides grouped by category, and by domain within it.
 *
 * Two levels because a reader browses at the first and buys at the second:
 * Body tells them they are in the right half of the library, Houding tells
 * them they are on the right shelf.
 *
 * The pillar e-book sorts to the front of its domain regardless of `order`, so
 * a reader meets the whole-domain book before the single-problem guides.
 * Anything empty is dropped rather than rendered as a heading with nothing
 * under it.
 */
export async function getGuidesByCategory(locale: Locale): Promise<
  Array<{
    id: GuideCategoryId;
    domains: Array<{id: DomainId; guides: Guide[]}>;
  }>
> {
  const guides = await getGuides(locale);

  return guideCategories
    .map((category) => ({
      id: category,
      domains: domains
        .filter((domain) => domain.category === category)
        .map((domain) => ({
          id: domain.id as DomainId,
          guides: guides
            .filter((guide) => guide.domain === domain.id)
            .sort(
              (a, b) => Number(b.pillar ?? false) - Number(a.pillar ?? false)
            )
        }))
        .filter((domain) => domain.guides.length > 0)
    }))
    .filter((category) => category.domains.length > 0);
}

/** Guides with no domain set, so nothing is silently hidden from the shop. */
export async function getUngroupedGuides(locale: Locale): Promise<Guide[]> {
  const guides = await getGuides(locale);
  return guides.filter((guide) => !guide.domain);
}

/** One guide, or null when the slug does not exist in this language. */
export async function getGuide(
  locale: Locale,
  slug: string
): Promise<Guide | null> {
  // Guards against a slug like "../../.env" reaching the filesystem.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  try {
    const raw = await fs.readFile(
      path.join(GUIDES_ROOT, locale, `${slug}.mdx`),
      'utf8'
    );
    return parse(raw, slug, locale);
  } catch {
    return null;
  }
}

/**
 * Finds a guide by slug in any language.
 *
 * Downloads and webhooks work from a slug alone, with no locale in hand: the
 * same purchase has to resolve whether the buyer came from the .com or the .nl.
 */
export async function findGuide(slug: string): Promise<Guide | null> {
  for (const locale of ['en', 'nl'] as const) {
    const guide = await getGuide(locale, slug);
    if (guide) return guide;
  }
  return null;
}

/** Every (locale, slug) pair — for generateStaticParams and the sitemap. */
export async function getAllGuideParams(): Promise<
  Array<{locale: Locale; slug: string}>
> {
  const perLocale = await Promise.all(
    (['en', 'nl'] as const).map(async (locale) => {
      const guides = await getGuides(locale);
      return guides.map((guide) => ({locale, slug: guide.slug}));
    })
  );
  return perLocale.flat();
}

/** The bytes of a guide, read from outside the public directory. */
export async function readGuideFile(guide: Guide): Promise<Buffer> {
  // The filename comes from frontmatter we wrote, but it is still joined
  // defensively: a stray "../" would otherwise read anything on disk.
  const name = path.basename(guide.file);
  return fs.readFile(path.join(FILES_ROOT, name));
}
