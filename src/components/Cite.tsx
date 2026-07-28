import {resolveCiteRef, type Citation, type CiteRef} from '@/lib/mdx';

type CiteProps = {
  /**
   * Citation id ("chen2022"), 1-based index (1), or an array of either.
   * Ids are preferred; indexes are supported for articles written before ids
   * existed.
   */
  n: CiteRef | CiteRef[];
  citations: Citation[];
  /**
   * Returns true for the first marker referencing a given source, so only that
   * marker carries the `cite-ref-N` id. Supplied by <Mdx />.
   */
  claimAnchor?: (number: number) => boolean;
};

/**
 * In-text citation marker, used inside MDX as <Cite n="chen2022" /> or
 * <Cite n={1} />. The `citations` prop is bound by <Mdx />, so articles only
 * ever write the `n` prop.
 *
 * This is what couples a specific claim to a specific source: the marker sits
 * directly after the sentence it supports and links to the numbered entry in the
 * source list, which in turn links back here.
 */
export default function Cite({n, citations, claimAnchor}: CiteProps) {
  const refs = Array.isArray(n) ? n : [n];

  // Unresolvable refs are rejected at load time by lib/mdx, so anything
  // reaching here resolves; the filter keeps the type honest.
  const numbers = refs
    .map((ref) => resolveCiteRef(ref, citations))
    .filter((number): number is number => number !== null);

  if (numbers.length === 0) return null;

  return (
    <sup className="ml-0.5 whitespace-nowrap">
      [
      {numbers.map((number, index) => (
        <span key={number}>
          {index > 0 && ', '}
          <a
            id={claimAnchor?.(number) === false ? undefined : `cite-ref-${number}`}
            href={`#source-${number}`}
            className="text-kratos-700 no-underline hover:underline"
          >
            {number}
          </a>
        </span>
      ))}
      ]
    </sup>
  );
}
