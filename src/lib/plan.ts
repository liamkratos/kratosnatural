import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import type {Locale} from '@/i18n/routing';

const PLAN_ROOT = path.join(process.cwd(), 'src', 'content', 'plan');

/**
 * The manifest — one document per language, written by hand.
 *
 * Parsed here rather than compiled as MDX, for the same reason the policies
 * are: this is prose that gets edited by whoever is writing it, and a stray
 * line that happens to look like JSX must not be able to fail the build. The
 * grammar understood below is exactly what the document uses — headings,
 * paragraphs, bold, italics and links — and anything else is carried through
 * as literal text rather than silently dropped.
 *
 * It is also not an article: the manifest is brand copy, so it is rendered in
 * the site's own card-and-display-face style rather than the `.paper` look the
 * research documents wear.
 */

export type InlineNode =
  | {type: 'text'; value: string}
  | {type: 'strong'; value: string}
  | {type: 'em'; value: string}
  | {type: 'link'; value: string; href: string};

/** A paragraph, as the inline runs it is made of. */
export type Paragraph = InlineNode[];

export type PlanSection = {
  /** Anchor id, generated the same way article headings are. */
  id: string;
  heading: string;
  paragraphs: Paragraph[];
};

export type Plan = {
  locale: Locale;
  /** Short title from frontmatter — used for the nav, the tab and the sitemap. */
  title: string;
  author: string;
  /** ISO date, e.g. "2026-08-06". */
  date: string;
  /** The document's own h1, which is longer than the frontmatter title. */
  heading: string;
  /** Everything between the h1 and the first h2: the byline line. */
  intro: Paragraph[];
  sections: PlanSection[];
  /**
   * The closing signature, when the document ends on the author's name. Pulled
   * out so it can be set as a signature instead of reading as body copy.
   */
  signature: string | null;
};

/**
 * Split a paragraph into inline runs.
 *
 * One pass, one combined pattern, so the order of markers in the source is the
 * order they come out in. Anything that does not match is text — an unclosed
 * `**` stays two asterisks on the page rather than swallowing the rest of the
 * document.
 */
export function parseInline(source: string): Paragraph {
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const nodes: Paragraph = [];
  let last = 0;

  const pushText = (value: string) => {
    if (value) nodes.push({type: 'text', value});
  };

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    pushText(source.slice(last, match.index));

    if (match[1] !== undefined) {
      nodes.push({type: 'link', value: match[1], href: match[2]});
    } else if (match[3] !== undefined) {
      nodes.push({type: 'strong', value: match[3]});
    } else {
      nodes.push({type: 'em', value: match[4]});
    }

    last = match.index + match[0].length;
  }

  pushText(source.slice(last));
  return nodes;
}

/** Flatten inline runs back to plain text, for meta descriptions and JSON-LD. */
export function inlineText(paragraph: Paragraph): string {
  return paragraph.map((node) => node.value).join('');
}

function parsePlan(locale: Locale, raw: string): Plan {
  const ref = `plan/${locale}.md`;
  const {data, content} = matter(raw);

  for (const field of ['title', 'author', 'date'] as const) {
    if (!data[field]) {
      throw new Error(
        `Plan "${ref}" is missing required frontmatter "${field}".`
      );
    }
  }

  const slugger = new GithubSlugger();
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  let heading = data.title as string;
  const intro: Paragraph[] = [];
  const sections: PlanSection[] = [];

  for (const block of blocks) {
    const h1 = block.match(/^#\s+(.+)$/);
    if (h1) {
      heading = h1[1].trim();
      continue;
    }

    const h2 = block.match(/^##\s+(.+)$/);
    if (h2) {
      const text = h2[1].trim();
      sections.push({id: slugger.slug(text), heading: text, paragraphs: []});
      continue;
    }

    // Paragraphs may be wrapped in the source; join the lines back up so the
    // browser, not the editor's line breaks, decides where a line ends.
    const paragraph = parseInline(block.replace(/\s*\n\s*/g, ' '));
    (sections.at(-1)?.paragraphs ?? intro).push(paragraph);
  }

  // A document that ends on the author's name is signed, not still talking.
  let signature: string | null = null;
  const lastSection = sections.at(-1);
  const lastParagraph = lastSection?.paragraphs.at(-1);
  if (lastParagraph && inlineText(lastParagraph).trim() === data.author) {
    signature = data.author as string;
    lastSection!.paragraphs.pop();
  }

  return {
    locale,
    title: data.title as string,
    author: data.author as string,
    date: String(data.date),
    heading,
    intro,
    sections,
    signature
  };
}

export async function getPlan(locale: Locale): Promise<Plan | null> {
  try {
    const raw = await fs.readFile(path.join(PLAN_ROOT, `${locale}.md`), 'utf8');
    return parsePlan(locale, raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
