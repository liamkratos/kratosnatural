import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type {Locale} from '@/i18n/routing';

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
 * The domain a guide belongs to, from the assortment plan.
 *
 * A closed list rather than free-form strings: a typo in frontmatter would
 * otherwise silently create a near-empty domain on the shop page. Order here is
 * the order domains appear.
 */
export const domains = [
  {id: 'licht', label: 'Licht & circadiaan'},
  {id: 'supplementen', label: 'Supplementen'},
  {id: 'testen', label: 'Bloedwaarden & testen'},
  {id: 'houding', label: 'Houding & mechanica'},
  {id: 'slaap', label: 'Slaap'},
  {id: 'voeding', label: 'Voeding'},
  {id: 'kracht', label: 'Kracht & spiermassa'},
  {id: 'stress', label: 'Stress & zenuwstelsel'},
  {id: 'darmen', label: 'Darmen & spijsvertering'},
  {id: 'metabool', label: 'Metabole gezondheid'}
] as const;

export type DomainId = (typeof domains)[number]['id'];

export function isDomainId(value: string): value is DomainId {
  return domains.some((domain) => domain.id === value);
}

export function domainLabel(id: DomainId): string {
  return domains.find((domain) => domain.id === id)?.label ?? id;
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

  return {...(front as GuideFrontmatter), slug, locale};
}

/** Drafts are visible in development and excluded from production builds. */
function isVisible(guide: Guide) {
  return !guide.draft || process.env.NODE_ENV !== 'production';
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
 * Guides grouped by domain, in the order declared above.
 *
 * The pillar e-book sorts to the front of its domain regardless of `order`, so
 * a reader meets the whole-domain book before the single-problem guides.
 * Domains with nothing published are omitted rather than rendered empty.
 */
export async function getGuidesByDomain(
  locale: Locale
): Promise<Array<{id: DomainId; label: string; guides: Guide[]}>> {
  const guides = await getGuides(locale);

  return domains
    .map((domain) => ({
      id: domain.id,
      label: domain.label,
      guides: guides
        .filter((guide) => guide.domain === domain.id)
        .sort((a, b) => Number(b.pillar ?? false) - Number(a.pillar ?? false))
    }))
    .filter((group) => group.guides.length > 0);
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
