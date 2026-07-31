import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import type {Locale} from '@/i18n/routing';
import {locales} from '@/i18n/routing';

const ARTICLES_ROOT = path.join(process.cwd(), 'src', 'content', 'articles');

/**
 * A single source backing a claim in an article.
 *
 * At least one of `pmid`, `doi` or `url` must be present, otherwise the
 * citation cannot be resolved to anything and the article fails to load.
 */
export type Citation = {
  /**
   * Optional stable key, e.g. "chen2022", referenced from the body as
   * <Cite n="chen2022" />. Preferred over numeric indexes: reordering the
   * citation list then cannot silently repoint a marker at the wrong source.
   */
  id?: string;
  /** Full reference text: authors, title, journal, year. */
  text: string;
  /** PubMed ID, e.g. "28642676". */
  pmid?: string;
  /** DOI, e.g. "10.1093/nutrit/nux012" (with or without a doi.org prefix). */
  doi?: string;
  /** Explicit URL; used when neither pmid nor doi applies. */
  url?: string;
};

/** An optional dataset offered for download alongside an article. */
export type ArticleDownload = {
  file: string;
  size?: string;
  contents?: string[];
  audience?: string;
};

/** A reference as written in the body: either a citation id or a 1-based index. */
export type CiteRef = string | number;

/**
 * Article collections.
 *
 * A closed list rather than free-form strings: a typo in frontmatter would
 * otherwise silently create a new, near-empty collection on the research page.
 * Order here is the order they appear on that page.
 */
export const collections = [
  {id: 'longevity-molecules', label: 'Longevity molecules (Supplements)'},
  {id: 'light-therapy', label: 'Light & devices'},
  {id: 'quality', label: 'Quality & testing'}
] as const;

export type CollectionId = (typeof collections)[number]['id'];

export function isCollectionId(value: string): value is CollectionId {
  return collections.some((collection) => collection.id === value);
}

export function collectionLabel(id: CollectionId): string {
  return collections.find((collection) => collection.id === id)?.label ?? id;
}

export type ArticleFrontmatter = {
  title: string;
  /** Short label for the cover artwork, e.g. "Nattokinase". Falls back to title. */
  shortTitle?: string;
  description: string;
  /** ISO date, e.g. "2026-06-18". */
  publishDate: string;
  updatedDate?: string;
  author: string;
  /** Number of studies the article draws on. */
  studyCount?: number;
  /** Standalone, self-contained conclusions shown at the top. */
  keyFindings?: string[];
  citations?: Citation[];
  image?: string;
  tags?: string[];
  /** Which collection this article belongs to on the research page. */
  collection?: CollectionId;
  /** Dataset offered for download in the article. */
  download?: ArticleDownload;
  draft?: boolean;
};

export type TocEntry = {
  /** Heading depth: 2 for h2, 3 for h3. */
  depth: number;
  text: string;
  /** Anchor id, matching what rehype-slug generates. */
  id: string;
};

export type Article = Omit<ArticleFrontmatter, 'keyFindings' | 'citations'> & {
  slug: string;
  locale: Locale;
  body: string;
  keyFindings: string[];
  citations: Citation[];
  toc: TocEntry[];
  readingTimeMinutes: number;
};

/** Article metadata without the MDX body — enough for listings. */
export type ArticleSummary = Omit<Article, 'body' | 'toc'>;

function localeDir(locale: Locale) {
  return path.join(ARTICLES_ROOT, locale);
}

/**
 * Resolve a citation to a canonical URL.
 *
 * PubMed is preferred over DOI so that citations point at a stable, indexable
 * landing page rather than a publisher paywall.
 */
export function citationUrl(citation: Citation): string | null {
  if (citation.pmid) {
    return `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid.trim()}/`;
  }
  if (citation.doi) {
    const doi = citation.doi.trim().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');
    return `https://doi.org/${doi}`;
  }
  return citation.url ?? null;
}

/** Strip fenced code blocks so their `#` lines are not read as headings. */
function stripCodeFences(body: string) {
  return body.replace(/^```[\s\S]*?^```/gm, '');
}

/**
 * Build a table of contents from the MDX h2/h3 headings.
 *
 * Ids come from GithubSlugger, the same slugger rehype-slug uses, so the anchors
 * here match the ids rendered into the article — including its dedupe suffixes
 * for repeated headings.
 */
export function extractToc(body: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  const headingPattern = /^(#{2,3})\s+(.+?)\s*#*\s*$/gm;

  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(stripCodeFences(body))) !== null) {
    const text = match[2]
      // Unwrap the common inline markdown so the TOC reads as plain text.
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();

    if (!text) continue;
    entries.push({depth: match[1].length, text, id: slugger.slug(text)});
  }

  return entries;
}

function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function validateCitations(citations: unknown, ref: string): Citation[] {
  if (citations === undefined) return [];
  if (!Array.isArray(citations)) {
    throw new Error(`Article "${ref}": "citations" must be an array.`);
  }

  const seenIds = new Set<string>();

  return citations.map((entry, index) => {
    const citation = entry as Partial<Citation>;
    if (!citation?.text) {
      throw new Error(
        `Article "${ref}": citation ${index + 1} is missing "text".`
      );
    }
    if (!citation.pmid && !citation.doi && !citation.url) {
      throw new Error(
        `Article "${ref}": citation ${index + 1} ("${citation.text.slice(0, 40)}…") needs at least one of pmid, doi or url.`
      );
    }
    if (citation.id !== undefined) {
      const id = String(citation.id);
      if (seenIds.has(id)) {
        throw new Error(
          `Article "${ref}": duplicate citation id "${id}". Ids must be unique so <Cite n="${id}" /> resolves to one source.`
        );
      }
      seenIds.add(id);
    }
    return {
      id: citation.id !== undefined ? String(citation.id) : undefined,
      text: citation.text,
      pmid: citation.pmid,
      doi: citation.doi,
      url: citation.url
    };
  });
}

/**
 * Parse the `n` expression of a <Cite /> marker into its references.
 * Handles n={1}, n={[1,2]}, n="chen2022" and n={['a','b']}.
 */
function parseCiteExpression(raw: string): CiteRef[] {
  const inner = raw.startsWith('{') ? raw.slice(1, -1).trim() : raw;

  const quoted = inner.match(/['"]([^'"]+)['"]/g);
  if (quoted) return quoted.map((token) => token.slice(1, -1));

  const numbers = inner.match(/\d+/g);
  return numbers ? numbers.map(Number) : [];
}

/** Every reference used by a <Cite /> marker in the body, in document order. */
export function extractCiteRefs(body: string): CiteRef[] {
  const pattern = /<Cite\s+n=(\{[\s\S]*?\}|"[^"]*"|'[^']*')\s*\/>/g;
  const refs: CiteRef[] = [];

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) {
    refs.push(...parseCiteExpression(match[1]));
  }
  return refs;
}

/**
 * Resolve a reference to a 1-based position in the citation list.
 * Returns null when it does not resolve.
 */
export function resolveCiteRef(
  ref: CiteRef,
  citations: Citation[]
): number | null {
  if (typeof ref === 'number') {
    return ref >= 1 && ref <= citations.length ? ref : null;
  }
  const index = citations.findIndex((citation) => citation.id === ref);
  return index === -1 ? null : index + 1;
}

/**
 * Fail the build when a marker points at a source that does not exist, rather
 * than rendering a dead link next to a medical claim.
 */
function validateCiteRefs(body: string, citations: Citation[], ref: string) {
  for (const citeRef of extractCiteRefs(body)) {
    if (resolveCiteRef(citeRef, citations) !== null) continue;

    const known = citations
      .map((citation, index) => citation.id ?? String(index + 1))
      .join(', ');
    throw new Error(
      `Article "${ref}": <Cite n="${citeRef}" /> does not match any citation. Known citations: ${known || '(none)'}.`
    );
  }
}

function parseArticle(locale: Locale, slug: string, raw: string): Article {
  const ref = `${locale}/${slug}.mdx`;
  const {data, content} = matter(raw);
  const fm = data as Partial<ArticleFrontmatter>;

  for (const field of ['title', 'description', 'publishDate', 'author'] as const) {
    if (!fm[field]) {
      throw new Error(`Article "${ref}" is missing required frontmatter "${field}".`);
    }
  }

  const keyFindings = fm.keyFindings ?? [];
  if (!Array.isArray(keyFindings)) {
    throw new Error(`Article "${ref}": "keyFindings" must be an array.`);
  }

  if (fm.collection && !isCollectionId(fm.collection)) {
    throw new Error(
      `Article "${ref}": unknown collection "${fm.collection}". Valid ids: ${collections.map((c) => c.id).join(', ')}.`
    );
  }

  const citations = validateCitations(fm.citations, ref);
  validateCiteRefs(content, citations, ref);

  return {
    title: fm.title!,
    shortTitle: fm.shortTitle,
    description: fm.description!,
    publishDate: fm.publishDate!,
    updatedDate: fm.updatedDate,
    author: fm.author!,
    studyCount: fm.studyCount,
    image: fm.image,
    tags: fm.tags ?? [],
    collection: fm.collection,
    download: fm.download,
    draft: fm.draft ?? false,
    slug,
    locale,
    body: content,
    keyFindings,
    citations,
    toc: extractToc(content),
    readingTimeMinutes: estimateReadingTime(content)
  };
}

/** Drafts are visible in development and excluded from production builds. */
function isVisible(article: Article) {
  return !article.draft || process.env.NODE_ENV !== 'production';
}

export async function getArticleSlugs(locale: Locale): Promise<string[]> {
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

export async function getArticle(
  locale: Locale,
  slug: string
): Promise<Article | null> {
  for (const extension of ['.mdx', '.md']) {
    try {
      const raw = await fs.readFile(
        path.join(localeDir(locale), `${slug}${extension}`),
        'utf8'
      );
      return parseArticle(locale, slug, raw);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return null;
}

export type SortKey = 'publishDate' | 'updatedDate' | 'title' | 'studyCount';
export type SortOptions = {by?: SortKey; order?: 'asc' | 'desc'};

/** Sort articles in place-free fashion; defaults to newest first. */
export function sortArticles<T extends ArticleSummary>(
  articles: T[],
  {by = 'publishDate', order = 'desc'}: SortOptions = {}
): T[] {
  const direction = order === 'asc' ? 1 : -1;

  return [...articles].sort((a, b) => {
    let result: number;
    switch (by) {
      case 'title':
        result = a.title.localeCompare(b.title, a.locale);
        break;
      case 'studyCount':
        result = (a.studyCount ?? 0) - (b.studyCount ?? 0);
        break;
      case 'updatedDate':
        result = (a.updatedDate ?? a.publishDate).localeCompare(
          b.updatedDate ?? b.publishDate
        );
        break;
      default:
        result = a.publishDate.localeCompare(b.publishDate);
    }
    // Stable tiebreak so ordering never depends on filesystem read order.
    return result !== 0 ? result * direction : a.slug.localeCompare(b.slug);
  });
}

/**
 * All visible articles for a locale, newest first by default.
 * Returns summaries (no MDX body) — listings never need the content.
 */
export async function getArticles(
  locale: Locale,
  options?: SortOptions
): Promise<ArticleSummary[]> {
  const slugs = await getArticleSlugs(locale);
  const loaded = await Promise.all(slugs.map((slug) => getArticle(locale, slug)));

  const summaries = loaded
    .filter((article): article is Article => article !== null)
    .filter(isVisible)
    .map(({body: _body, toc: _toc, ...summary}) => summary);

  return sortArticles(summaries, options);
}

/** Every (locale, slug) pair — for generateStaticParams and sitemaps. */
export async function getAllArticleParams(): Promise<
  Array<{locale: Locale; slug: string}>
> {
  const perLocale = await Promise.all(
    locales.map(async (locale) => {
      const articles = await getArticles(locale);
      return articles.map((article) => ({locale, slug: article.slug}));
    })
  );
  return perLocale.flat();
}

/** All tags used in a locale, with counts, most frequent first. */
export async function getTags(
  locale: Locale
): Promise<Array<{tag: string; count: number}>> {
  const articles = await getArticles(locale);
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({tag, count}))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Articles grouped by collection, in the order declared above.
 * Collections with no published articles are omitted rather than rendered empty.
 */
export async function getArticlesByCollection(locale: Locale): Promise<
  Array<{id: CollectionId; label: string; articles: ArticleSummary[]}>
> {
  const articles = await getArticles(locale);

  return collections
    .map((collection) => ({
      id: collection.id,
      label: collection.label,
      articles: articles.filter((article) => article.collection === collection.id)
    }))
    .filter((group) => group.articles.length > 0);
}

/** Articles not assigned to any collection, so nothing is silently hidden. */
export async function getUncollectedArticles(
  locale: Locale
): Promise<ArticleSummary[]> {
  const articles = await getArticles(locale);
  return articles.filter((article) => !article.collection);
}
