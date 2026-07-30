import type {ReactNode} from 'react';

/**
 * Callout blocks used inside article MDX, following the layout of the source
 * research document: a bordered study card and a highlighted finding.
 *
 * `<Study>` carries a coloured left rule and a PMID that links to PubMed, so a
 * reader can jump from a claim to the paper in one click. `verdict` is used to
 * state plainly when a trial found nothing — the null results are the reason
 * this page can be trusted, so they are given the same visual weight as the
 * positive ones rather than being buried in prose.
 */
export function Study({
  title,
  design,
  pmid,
  verdict = 'neutral',
  children
}: {
  title: string;
  design?: string;
  pmid?: string;
  verdict?: 'positive' | 'null' | 'caution' | 'neutral';
  children: ReactNode;
}) {
  const rule = {
    positive: 'border-l-emerald-600',
    null: 'border-l-slate-400',
    caution: 'border-l-amber-500',
    neutral: 'border-l-sky-600'
  }[verdict];

  return (
    <aside
      className={`my-6 rounded-r-[12px] border border-ink/10 border-l-4 bg-white p-5 ${rule}`}
    >
      <p className="font-bold text-black">{title}</p>
      {design && <p className="mt-1 text-sm text-black">{design}</p>}
      <div className="mt-3 space-y-2 text-sm leading-relaxed">{children}</div>
      {pmid && (
        <p className="mt-3 text-sm">
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-4 hover:text-pink"
          >
            PMID {pmid}
          </a>
        </p>
      )}
    </aside>
  );
}

/** Highlighted takeaway, equivalent to the source document's key-finding box. */
export function Finding({children}: {children: ReactNode}) {
  return (
    <p className="my-6 rounded-[12px] border border-amber-300 bg-amber-50 p-4 font-medium leading-relaxed text-black">
      {children}
    </p>
  );
}
