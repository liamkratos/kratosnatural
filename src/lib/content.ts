import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type {Locale} from '@/i18n/routing';
import {locales} from '@/i18n/routing';

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content');

export type ArticleFrontmatter = {
  title: string;
  description: string;
  /** ISO date, e.g. "2026-07-14" */
  date: string;
  updated?: string;
  author?: string;
  image?: string;
  tags?: string[];
  draft?: boolean;
};

export type Article = ArticleFrontmatter & {
  slug: string;
  locale: Locale;
  body: string;
  readingTimeMinutes: number;
};

function localeDir(locale: Locale) {
  return path.join(CONTENT_ROOT, locale);
}

function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseArticle(locale: Locale, slug: string, raw: string): Article {
  const {data, content} = matter(raw);
  const frontmatter = data as Partial<ArticleFrontmatter>;

  if (!frontmatter.title || !frontmatter.date) {
    throw new Error(
      `Article "${locale}/${slug}.mdx" is missing a required "title" or "date" frontmatter field.`
    );
  }

  return {
    title: frontmatter.title,
    description: frontmatter.description ?? '',
    date: frontmatter.date,
    updated: frontmatter.updated,
    author: frontmatter.author,
    image: frontmatter.image,
    tags: frontmatter.tags ?? [],
    draft: frontmatter.draft ?? false,
    slug,
    locale,
    body: content,
    readingTimeMinutes: estimateReadingTime(content)
  };
}

/** Slugs of all MDX files for a locale, drafts included. */
export async function getArticleSlugs(locale: Locale): Promise<string[]> {
  try {
    const entries = await fs.readdir(localeDir(locale));
    return entries
      .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
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
    const filePath = path.join(localeDir(locale), `${slug}${extension}`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return parseArticle(locale, slug, raw);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return null;
}

/** All published articles for a locale, newest first. */
export async function getArticles(locale: Locale): Promise<Article[]> {
  const slugs = await getArticleSlugs(locale);
  const articles = await Promise.all(
    slugs.map((slug) => getArticle(locale, slug))
  );

  return articles
    .filter((article): article is Article => article !== null)
    .filter((article) => !article.draft || process.env.NODE_ENV !== 'production')
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Every (locale, slug) pair — for generateStaticParams and the sitemap. */
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
