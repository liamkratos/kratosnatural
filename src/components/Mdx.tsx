import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import {Link} from '@/i18n/navigation';
import Cite from '@/components/Cite';
import {Study, Finding} from '@/components/Study';
import type {Citation, CiteRef} from '@/lib/mdx';

/**
 * Components available inside MDX articles. Internal links go through the
 * locale-aware Link so they respect domain routing; external links open safely.
 */
const baseComponents = {
  // Only `children` is forwarded to Link: spreading raw anchor props onto it
  // clashes with next/link's narrower prop types.
  a: ({href = '', children, ...props}: React.ComponentProps<'a'>) => {
    if (href.startsWith('/')) {
      return <Link href={href}>{children}</Link>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  // GFM tables can overflow on narrow screens; scroll the table, not the page.
  table: (props: React.ComponentProps<'table'>) => (
    <div className="my-6 overflow-x-auto">
      <table {...props} />
    </div>
  )
};

export default function Mdx({
  source,
  citations = []
}: {
  source: string;
  citations?: Citation[];
}) {
  /**
   * A source may be cited several times. Only the first marker for each source
   * gets the `cite-ref-N` anchor, so the id stays unique in the document and the
   * back-link from the source list lands on a real marker.
   */
  const anchored = new Set<number>();
  const claimAnchor = (number: number) => {
    if (anchored.has(number)) return false;
    anchored.add(number);
    return true;
  };

  const components = {
    ...baseComponents,
    Study,
    Finding,
    Cite: (props: {n: CiteRef | CiteRef[]}) => (
      <Cite {...props} citations={citations} claimAnchor={claimAnchor} />
    )
  };

  /*
   * No `prose` wrapper here. The Tailwind typography plugin selects with
   * `.prose :where(h2):not(…)`, which outranks the `.paper h2` rules carrying
   * the research document's type scale and blue heading rules, so the two
   * cannot both apply. The document's own stylesheet wins, and the spacing
   * rules on `.paper-body` in globals.css replace what prose was providing.
   */
  return (
    <div className="paper-body">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug]
          }
        }}
      />
    </div>
  );
}
