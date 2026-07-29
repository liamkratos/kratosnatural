import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const POLICIES_ROOT = path.join(process.cwd(), 'src', 'content', 'policies');

/**
 * Policy documents.
 *
 * Held as content files so the legal text can be edited without touching code,
 * and returned as plain paragraphs rather than compiled as MDX. Legal prose is
 * arbitrary text: the shipping policy contains the line "import duties, taxes,
 * or customs fees", which MDX parses as an ES import and refuses to build. A
 * document edited by someone who is not a developer must not be able to break
 * the site, so nothing here is treated as code.
 *
 * They exist only in Dutch. The source documents are Dutch, and a
 * machine-translated privacy policy or terms of service would be worse than
 * none at all, so English serves the same text rather than an invented
 * translation.
 */
export const policySlugs = [
  'privacy',
  'refund',
  'terms',
  'shipping',
  'contact',
  'legal'
] as const;

export type PolicySlug = (typeof policySlugs)[number];

export type Policy = {
  slug: PolicySlug;
  title: string;
  /** Body split into paragraphs, ready to render as plain text. */
  paragraphs: string[];
};

export function isPolicySlug(value: string): value is PolicySlug {
  return (policySlugs as readonly string[]).includes(value);
}

export async function getPolicy(slug: string): Promise<Policy | null> {
  if (!isPolicySlug(slug)) return null;

  try {
    const raw = await fs.readFile(
      path.join(POLICIES_ROOT, 'nl', `${slug}.md`),
      'utf8'
    );
    const {data, content} = matter(raw);

    return {
      slug,
      title: (data.title as string) ?? slug,
      paragraphs: content
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
