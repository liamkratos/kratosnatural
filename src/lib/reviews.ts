/**
 * Customer reviews, as shown on the site.
 *
 * Deliberately not marked up as `AggregateRating`. Google treats reviews about
 * an organisation, collected and published by that organisation, as
 * self-serving: they are excluded from rich results for Organization and
 * LocalBusiness, and marking them up anyway risks a manual action that removes
 * every rich result the site has, not just the stars. The stars in a search
 * result come from the Google Business Profile, which is fed by the reviews
 * themselves, so the useful thing here is to show them and link to the profile.
 *
 * Product reviews are a different case and would be eligible, but there are no
 * sales yet, so there is nothing honest to put there.
 */
export type Review = {
  /** Reviewer's name as it appears on the public profile. */
  author: string;
  /** Whole stars, 1 to 5. */
  rating: 1 | 2 | 3 | 4 | 5;
  /**
   * The review as written. Left in the reviewer's own language and never
   * translated: a quote is someone's words, and a translated one presented as
   * theirs is not what they said. The `lang` attribute tells a screen reader
   * and a search engine which language it is in.
   *
   * Omitted for a star-only review. Those are real and count towards the
   * average; inventing a sentence for them would not be.
   */
  body?: string;
  /** BCP 47 tag for `body`. */
  lang?: 'en' | 'nl';
  /** ISO date, used to order newest first. */
  date?: string;
};

/**
 * Where to read and write reviews.
 *
 * Fill this with the "write a review" link from the Google Business Profile
 * (Profile → Ask for reviews → copy link). Until it is set the invitation is
 * not rendered, because a button that leads nowhere is worse than no button.
 */
export const GOOGLE_REVIEW_URL = 'https://g.page/r/CevpmDLkTxW_EBM/review';

/**
 * The reviews themselves. Add each one as it comes in, with the reviewer's
 * name as it appears publicly, so what is on the site can be checked against
 * what is on Google.
 */
export const REVIEWS: Review[] = [
  {
    author: 'Otis Ripping',
    rating: 5,
    body: 'Goed geholpen',
    lang: 'nl',
    date: '2026-01-03'
  },
  {
    author: 'Raul Singh',
    rating: 5,
    date: '2025-09-03'
  }
];

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
