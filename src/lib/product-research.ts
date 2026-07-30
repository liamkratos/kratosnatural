import type {Locale} from '@/i18n/routing';
import {getArticle, type Article} from '@/lib/mdx';
import type {Product, ProductClaim} from '@/lib/products';

/**
 * The evidence block behind a product, with every reference resolved.
 *
 * A product's frontmatter names articles by slug. Resolving them here rather
 * than trusting the string means a renamed or deleted analysis breaks the build
 * instead of leaving a shop page making claims that link nowhere — which is the
 * exact failure that turns an evidence block back into marketing copy.
 */
export type ResolvedClaim = ProductClaim & {
  articleTitle: string;
  href: string;
};

export type ResolvedResearch = {
  articles: Array<{
    slug: string;
    title: string;
    shortTitle?: string;
    description: string;
    studyCount?: number;
    citationCount: number;
    href: string;
  }>;
  claims: ResolvedClaim[];
};

function href(slug: string) {
  return `/articles/${slug}`;
}

async function requireArticle(
  locale: Locale,
  slug: string,
  context: string
): Promise<Article> {
  const article = await getArticle(locale, slug);
  if (!article) {
    throw new Error(
      `${context} references article "${locale}/${slug}", which does not exist. ` +
        `Every product claim must link to a published analysis.`
    );
  }
  return article;
}

export async function resolveResearch(
  product: Product
): Promise<ResolvedResearch | null> {
  const research = product.research;
  if (!research) return null;

  const context = `Product "${product.locale}/${product.slug}"`;

  // A claim's article is linked whether or not it is also listed in
  // `articles`, so a claim can never be the only mention of a source.
  const slugs = [
    ...new Set([
      ...(research.articles ?? []),
      ...(research.claims ?? []).map((claim) => claim.article)
    ])
  ];

  const loaded = new Map<string, Article>();
  await Promise.all(
    slugs.map(async (slug) => {
      loaded.set(slug, await requireArticle(product.locale, slug, context));
    })
  );

  const articles = slugs.map((slug) => {
    const article = loaded.get(slug)!;
    return {
      slug,
      title: article.title,
      shortTitle: article.shortTitle,
      description: article.description,
      studyCount: article.studyCount,
      citationCount: article.citations.length,
      href: href(slug)
    };
  });

  const claims = (research.claims ?? []).map((claim) => ({
    ...claim,
    articleTitle: loaded.get(claim.article)!.shortTitle ?? loaded.get(claim.article)!.title,
    href: href(claim.article)
  }));

  if (articles.length === 0 && claims.length === 0) return null;

  return {articles, claims};
}
