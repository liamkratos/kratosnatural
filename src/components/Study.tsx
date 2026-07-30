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
  /**
   * The orange rule is the document's own; the verdict recolours it so a null
   * result is legible at a glance rather than only on reading. Grey is not a
   * demotion — it is the flag that says "this trial found nothing", which is
   * the reason the page can be trusted.
   */
  const rule = {
    positive: '#ff6600',
    null: '#8a8a8a',
    caution: '#d97706',
    neutral: '#0066cc'
  }[verdict];

  return (
    <aside className="study-citation" style={{borderLeftColor: rule}}>
      <p>
        <strong>{title}</strong>
      </p>
      {design && <p style={{color: '#333', fontStyle: 'italic'}}>{design}</p>}
      <div className="mt-2 space-y-2">{children}</div>
      {pmid && (
        <p className="mt-2">
          <a
            className="pmid-link"
            href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            PMID: {pmid}
          </a>
        </p>
      )}
    </aside>
  );
}

/** Highlighted takeaway, the source document's `.key-finding` box. */
export function Finding({children}: {children: ReactNode}) {
  return <div className="key-finding">{children}</div>;
}
